/// <reference types="web-bluetooth" />

/**
 * Web Bluetooth API Helper for Fitmora
 * Connects to physical BLE fitness equipment (Treadmills, Smart Bikes) and Heart Rate monitors.
 */

export interface BleDeviceData {
  speed?: number;      // km/h
  incline?: number;    // %
  cadence?: number;    // RPM
  heartRate?: number;  // BPM
  distance?: number;   // km
}

export class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private fitnessChar: BluetoothRemoteGATTCharacteristic | null = null;
  private controlChar: BluetoothRemoteGATTCharacteristic | null = null;
  private heartChar: BluetoothRemoteGATTCharacteristic | null = null;

  /**
   * Checks if Web Bluetooth is supported in the current browser
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Scans and requests a Bluetooth Low Energy device (Fitness Machine or Heart Rate Monitor)
   */
  public async requestDevice(onDataReceived: (data: BleDeviceData) => void): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth API no es soportada por este navegador. Por favor usa Google Chrome, Edge u Opera.');
    }

    try {
      // 1. Request BLE device matching Fitness Machine or Heart Rate services
      const requestedDevice = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['fitness_machine'] },
          { services: ['heart_rate'] }
        ],
        optionalServices: ['generic_access']
      });

      this.device = requestedDevice;
      
      // Listen to disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.disconnect();
      });

      // 2. Connect to the GATT server
      if (!this.device.gatt) {
        throw new Error('El dispositivo no posee perfil GATT.');
      }
      this.server = await this.device.gatt.connect();

      // 3. Probe services
      // Try to hook Fitness Machine Service (UUID: 0x1826)
      try {
        const fitnessService = await this.server.getPrimaryService('fitness_machine');
        
        // Treadmill Data characteristic (UUID: 0x2ACD) or Indoor Bike (0x2AD2)
        try {
          // Attempt to get Treadmill Data
          this.fitnessChar = await fitnessService.getCharacteristic('treadmill_data');
        } catch {
          try {
            // Attempt to get Bike Data
            this.fitnessChar = await fitnessService.getCharacteristic('indoor_bike_data');
          } catch {
            // Standard fallback characteristic search
            const chars = await fitnessService.getCharacteristics();
            if (chars.length > 0) this.fitnessChar = chars[0];
          }
        }

        if (this.fitnessChar) {
          await this.fitnessChar.startNotifications();
          this.fitnessChar.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = event.target.value as DataView;
            const parsed = this.parseFitnessMachineData(value, this.device?.name || '');
            onDataReceived(parsed);
          });
        }

        // Get Control Point Characteristic (UUID: 0x2AD9)
        try {
          this.controlChar = await fitnessService.getCharacteristic('fitness_machine_control_point');
          // Request Control (Opcode 0x00)
          await this.requestControl();
        } catch (err) {
          console.warn('No se pudo establecer control del dispositivo:', err);
        }
      } catch (err) {
        console.log('No fitness machine service active, checking heart rate service...', err);
      }

      // Try to hook Heart Rate Service (UUID: 0x180D)
      try {
        const hrService = await this.server.getPrimaryService('heart_rate');
        this.heartChar = await hrService.getCharacteristic('heart_rate_measurement');
        await this.heartChar.startNotifications();
        this.heartChar.addEventListener('characteristicvaluechanged', (event: any) => {
          const value = event.target.value as DataView;
          const heartRate = this.parseHeartRate(value);
          onDataReceived({ heartRate });
        });
      } catch (err) {
        console.log('No heart rate service active on this device.', err);
      }

      return this.device.name || 'Dispositivo Fitness BLE';
    } catch (err: any) {
      this.disconnect();
      throw err;
    }
  }

  /**
   * Disconnects the active Bluetooth session
   */
  public disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.fitnessChar = null;
    this.controlChar = null;
    this.heartChar = null;
  }

  /**
   * Request control of the fitness machine (Opcode 0x00)
   */
  public async requestControl(): Promise<void> {
    if (!this.controlChar) return;
    try {
      const command = new Uint8Array([0x00]);
      await this.controlChar.writeValue(command);
      console.log('FTMS Control Point control requested.');
    } catch (e) {
      console.warn('Failed to request FTMS control:', e);
    }
  }

  /**
   * Start or Resume the treadmill (Opcode 0x07)
   */
  public async startMachine(): Promise<void> {
    if (!this.controlChar) return;
    try {
      const command = new Uint8Array([0x07]);
      await this.controlChar.writeValue(command);
      console.log('FTMS Start command sent.');
    } catch (e) {
      console.warn('Failed to send start command:', e);
    }
  }

  /**
   * Stop or Pause the treadmill (Opcode 0x08, parameter: 0x01 = STOP, 0x02 = PAUSE)
   */
  public async stopMachine(pause: boolean = false): Promise<void> {
    if (!this.controlChar) return;
    try {
      const command = new Uint8Array([0x08, pause ? 0x02 : 0x01]);
      await this.controlChar.writeValue(command);
      console.log('FTMS Stop command sent.');
    } catch (e) {
      console.warn('Failed to send stop command:', e);
    }
  }

  /**
   * Set target speed in km/h (Opcode 0x02, speed in 0.01 km/h)
   */
  public async setMachineSpeed(speedKmh: number): Promise<void> {
    if (!this.controlChar) return;
    try {
      const speedRaw = Math.round(speedKmh * 100);
      const command = new Uint8Array(3);
      command[0] = 0x02; // Opcode
      command[1] = speedRaw & 0xFF;        // Speed LSB
      command[2] = (speedRaw >> 8) & 0xFF; // Speed MSB
      await this.controlChar.writeValue(command);
      console.log(`FTMS Speed command sent: ${speedKmh} km/h`);
    } catch (e) {
      console.warn('Failed to send speed command:', e);
    }
  }

  /**
   * Set target incline in % (Opcode 0x03, incline in 0.1 %)
   */
  public async setMachineIncline(inclinePercent: number): Promise<void> {
    if (!this.controlChar) return;
    try {
      const inclineRaw = Math.round(inclinePercent * 10);
      const command = new Uint8Array(3);
      command[0] = 0x03; // Opcode
      command[1] = inclineRaw & 0xFF;        // Incline LSB
      command[2] = (inclineRaw >> 8) & 0xFF; // Incline MSB
      await this.controlChar.writeValue(command);
      console.log(`FTMS Incline command sent: ${inclinePercent}%`);
    } catch (e) {
      console.warn('Failed to send incline command:', e);
    }
  }

  /**
   * Parses Standard BLE Bluetooth Treadmill Data (UUID: 0x2ACD)
   * BLE specification: Flags (16-bit), Speed (16-bit in km/h * 100), Distance (24-bit in m), Incline (16-bit * 10) etc.
   */
  private parseFitnessMachineData(value: DataView, deviceName: string): BleDeviceData {
    const data: BleDeviceData = {};
    try {
      const flags = value.getUint16(0, true);
      let offset = 2;

      // Bit 0: More Data (0 = present)
      // Standard speed is almost always present in FMS (Uint16 at offset 2, km/h divided by 100)
      if (value.byteLength >= offset + 2) {
        const speedRaw = value.getUint16(offset, true);
        data.speed = Number((speedRaw / 100).toFixed(1)); // e.g. 550 -> 5.5 km/h
        offset += 2;
      }

      // Bit 1: Average Speed present
      // Bit 2: Total Distance present (Uint24 at offset, in meters)
      const hasDistance = (flags & 0x0004) !== 0;
      if (hasDistance && value.byteLength >= offset + 3) {
        // Read 24-bit integer
        const distRaw = value.getUint8(offset) | (value.getUint8(offset + 1) << 8) | (value.getUint8(offset + 2) << 16);
        data.distance = Number((distRaw / 1000).toFixed(2)); // meters -> km
        offset += 3;
      }

      // Bit 3: Inclination & Ramp Angle present (Sint16 & Sint16, Incline in percent * 10)
      const hasIncline = (flags & 0x0008) !== 0;
      if (hasIncline && value.byteLength >= offset + 2) {
        const inclineRaw = value.getInt16(offset, true);
        data.incline = Number((inclineRaw / 10).toFixed(1)); // percent
        offset += 2;
      }

      // Fallback cadences if it's an indoor bike instead of treadmill
      if (deviceName.toLowerCase().includes('bike') || deviceName.toLowerCase().includes('cycle') || deviceName.toLowerCase().includes('spin')) {
        // Bike Cadence RPM is usually at offset 2 or 4 depending on flags
        if (value.byteLength >= offset + 2) {
          const cadenceRaw = value.getUint16(offset, true);
          data.cadence = Math.round(cadenceRaw * 0.5); // standard RPM scale factor
        }
      }
    } catch (e) {
      console.warn('Error parsing BLE packet:', e);
      // Sim default fallback on parser error
      data.speed = 5.5;
    }
    return data;
  }

  /**
   * Parses Standard BLE Heart Rate Measurement (UUID: 0x2A37)
   */
  private parseHeartRate(value: DataView): number {
    try {
      const flags = value.getUint8(0);
      const is16Bit = (flags & 0x01) !== 0;
      if (is16Bit) {
        return value.getUint16(1, true);
      } else {
        return value.getUint8(1);
      }
    } catch {
      return 110; // fallback BPM
    }
  }
}

export const bleService = new BluetoothService();
