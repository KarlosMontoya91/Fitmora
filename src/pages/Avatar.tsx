import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAvatarStore } from '../store/avatarStore';
import { useUserStore } from '../store/userStore';
import { useRewardStore } from '../store/rewardStore';
import { AvatarVisual } from '../components/avatar/AvatarVisual';
import { AVATAR_CATALOG } from '../data/avatarItems';
import { SkinTone, HairStyle, HairColor, ClothingType, ClothingColor, AccessoryType } from '../types/avatar';
import { ShoppingBag, Sparkles, Award, Palette, Shirt, UserCircle2, ArrowRight, Lock, CheckCircle2, CircleDollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Avatar: React.FC = () => {
  const location = useLocation();

  // Stores
  const { config, unlockedItemIds, updateConfig, buyItem } = useAvatarStore();
  const { profile } = useUserStore();
  const { achievements } = useRewardStore();

  const [activeTab, setActiveTab] = useState<'customize' | 'shop' | 'rewards'>('customize');
  const [shopCategory, setShopCategory] = useState<'clothing' | 'hairStyle' | 'accessory' | 'shoes'>('clothing');
  const [custCategory, setCustCategory] = useState<'body' | 'hair' | 'clothes' | 'accessories'>('body');

  useEffect(() => {
    // If navigated from achievements quick link, open rewards tab
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'rewards') {
      setActiveTab('rewards');
    }
  }, [location]);

  if (!profile) return null;

  // Customization selection lists
  const skinTones: { id: SkinTone; label: string; hex: string }[] = [
    { id: 'fair', label: 'Claro', hex: '#FFDBAC' },
    { id: 'peach', label: 'Durazno', hex: '#F1C27D' },
    { id: 'olive', label: 'Oliva', hex: '#E0AC69' },
    { id: 'bronze', label: 'Bronce', hex: '#C68642' },
    { id: 'dark', label: 'Oscuro', hex: '#8D5524' },
  ];

  const expressions = [
    { id: 'happy', label: 'Feliz' },
    { id: 'smile', label: 'Sonriente' },
    { id: 'determined', label: 'Focado' },
    { id: 'energetic', label: 'Activo' },
    { id: 'cool', label: 'Fresco' },
  ];

  const hairStyles: { id: HairStyle; label: string }[] = [
    { id: 'short', label: 'Corto' },
    { id: 'long', label: 'Largo' },
    { id: 'spiky', label: 'Spiky' },
    { id: 'curly', label: 'Rizado' },
    { id: 'ponytail', label: 'Coleta' },
    { id: 'bald', label: 'Calvo' },
  ];

  const hairColors: { id: HairColor; label: string; hex: string }[] = [
    { id: 'black', label: 'Negro', hex: '#111827' },
    { id: 'brown', label: 'Café', hex: '#5C3A21' },
    { id: 'blonde', label: 'Rubio', hex: '#F59E0B' },
    { id: 'red', label: 'Rojo', hex: '#DC2626' },
    { id: 'silver', label: 'Plata', hex: '#9CA3AF' },
  ];

  const clothingTypes: { id: ClothingType; label: string }[] = [
    { id: 'tshirt', label: 'T-Shirt' },
    { id: 'tanktop', label: 'Esqueleto' },
    { id: 'hoodie', label: 'Sudadera' },
    { id: 'jacket', label: 'Chaqueta' },
    { id: 'jersey', label: 'Jersey' },
  ];

  const clothingColors: { id: ClothingColor; label: string; hex: string }[] = [
    { id: 'indigo', label: 'Índigo', hex: '#4F46E5' },
    { id: 'cyan', label: 'Cyan', hex: '#06B6D4' },
    { id: 'green', label: 'Verde', hex: '#22C55E' },
    { id: 'orange', label: 'Naranja', hex: '#F97316' },
    { id: 'yellow', label: 'Amarillo', hex: '#FACC15' },
    { id: 'red', label: 'Rojo', hex: '#EF4444' },
    { id: 'purple', label: 'Morado', hex: '#A855F7' },
    { id: 'gold', label: 'Oro', hex: '#EAB308' },
  ];

  // Shop items selector
  const shopItems = AVATAR_CATALOG.filter(item => item.category === shopCategory);

  const handlePurchase = (itemId: string) => {
    const unlocked = buyItem(itemId);
    if (unlocked) {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
      });
      
      // Auto-equip purchased item
      const item = AVATAR_CATALOG.find(i => i.id === itemId);
      if (item) {
        if (item.category === 'clothing') {
          updateConfig({ clothingType: item.type as any, clothingColor: item.color as any });
        } else if (item.category === 'hairStyle') {
          updateConfig({ hairStyle: item.type as any });
        } else if (item.category === 'accessory') {
          updateConfig({ accessory: item.type as any });
        } else if (item.category === 'shoes') {
          updateConfig({ shoesColor: item.type as any });
        }
      }
    } else {
      alert('⚠️ Monedas insuficientes. ¡Completa más entrenamientos para ganar monedas! 💰');
    }
  };

  const equipItemFromCatalog = (item: any) => {
    if (!unlockedItemIds.includes(item.id)) return;
    
    if (item.category === 'clothing') {
      updateConfig({ clothingType: item.type, clothingColor: item.color });
    } else if (item.category === 'hairStyle') {
      updateConfig({ hairStyle: item.type });
    } else if (item.category === 'accessory') {
      updateConfig({ accessory: item.type });
    } else if (item.category === 'shoes') {
      updateConfig({ shoesColor: item.type });
    }
  };

  const isItemCurrentlyEquipped = (item: any) => {
    if (item.category === 'clothing') {
      return config.clothingType === item.type && config.clothingColor === item.color;
    }
    if (item.category === 'hairStyle') {
      return config.hairStyle === item.type;
    }
    if (item.category === 'accessory') {
      return config.accessory === item.type;
    }
    if (item.category === 'shoes') {
      return config.shoesColor === item.type;
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Live Avatar Preview Widget */}
      <section className="card-game p-5 flex flex-col items-center bg-gradient-to-b from-indigo-50/5 via-white to-white dark:from-slate-900/10 dark:via-slate-900 dark:to-slate-900 border-2">
        <AvatarVisual config={config} size={130} animate={true} />
        
        <div className="text-center mt-3.5">
          <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide leading-none">{profile.name}</h1>
          <span className="text-[10px] text-slate-400 font-extrabold block mt-1">NIVEL FÍSICO: {profile.level === 'beginner' ? 'PRINCIPIANTE' : profile.level === 'intermediate' ? 'INTERMEDIO' : 'AVANZADO'}</span>
        </div>
      </section>

      {/* 2. Flat Tab Selector (Duolingo Style) */}
      <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('customize')}
          className={`flex-1 rounded-xl py-2 text-center text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
            activeTab === 'customize'
              ? 'bg-white text-brand-primary shadow dark:bg-slate-800 dark:text-brand-primaryDark'
              : 'text-slate-400'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>ROPERO</span>
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 rounded-xl py-2 text-center text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
            activeTab === 'shop'
              ? 'bg-white text-brand-primary shadow dark:bg-slate-800 dark:text-brand-primaryDark'
              : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>TIENDA</span>
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 rounded-xl py-2 text-center text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
            activeTab === 'rewards'
              ? 'bg-white text-brand-primary shadow dark:bg-slate-800 dark:text-brand-primaryDark'
              : 'text-slate-400'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>LOGROS</span>
        </button>
      </div>

      {/* TAB CONTENT: CUSTOMIZE (Ropero Wardrobe) */}
      {activeTab === 'customize' && (
        <div className="flex flex-col gap-4.5 animate-fadeIn">
          {/* Sub-category selector */}
          <div className="flex justify-around border-b border-slate-100 pb-2 dark:border-slate-800">
            {[
              { id: 'body', label: 'Cuerpo' },
              { id: 'hair', label: 'Cabello' },
              { id: 'clothes', label: 'Ropa' },
              { id: 'accessories', label: 'Accesorios' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setCustCategory(sub.id as any)}
                className={`text-xs font-black pb-1.5 border-b-2 transition-all leading-none ${
                  custCategory === sub.id
                    ? 'border-brand-primary text-brand-primary dark:border-brand-primaryDark dark:text-brand-primaryDark'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub-content lists */}
          <div className="card-game p-4.5 bg-slate-50/50 dark:bg-slate-900/30">
            {custCategory === 'body' && (
              <div className="flex flex-col gap-4">
                {/* Skin tones */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tono de Piel</span>
                  <div className="flex gap-2">
                    {skinTones.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => updateConfig({ skinTone: s.id })}
                        className={`h-8 w-8 rounded-full border-2 transition-all active:scale-95 ${
                          config.skinTone === s.id ? 'border-brand-primary scale-110 shadow' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: s.hex }}
                        aria-label={s.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Expressions */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Expresión Facial</span>
                  <div className="flex flex-wrap gap-2">
                    {expressions.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => updateConfig({ expression: e.id as any })}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all active:scale-95 ${
                          config.expression === e.id
                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary dark:border-brand-primaryDark'
                            : 'border-slate-250 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-950'
                        }`}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {custCategory === 'hair' && (
              <div className="flex flex-col gap-4">
                {/* Hair styles */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Estilo de Cabello</span>
                  <div className="flex flex-wrap gap-2">
                    {hairStyles.map((h) => {
                      const catalogItem = AVATAR_CATALOG.find(i => i.category === 'hairStyle' && i.type === h.id);
                      const isUnlocked = catalogItem ? unlockedItemIds.includes(catalogItem.id) : true;
                      
                      return (
                        <button
                          key={h.id}
                          disabled={!isUnlocked}
                          onClick={() => updateConfig({ hairStyle: h.id })}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all active:scale-95 flex items-center gap-1 ${
                            config.hairStyle === h.id
                              ? 'border-brand-primary bg-brand-primary/5 text-brand-primary dark:border-brand-primaryDark'
                              : !isUnlocked
                              ? 'border-slate-200 bg-slate-100 text-slate-350 dark:border-slate-850 dark:bg-slate-900/50 cursor-not-allowed'
                              : 'border-slate-250 bg-white text-slate-500 dark:border-slate-850 dark:bg-slate-950'
                          }`}
                        >
                          {!isUnlocked && <Lock className="h-3 w-3 shrink-0" />}
                          <span>{h.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hair colors */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Color de Cabello</span>
                  <div className="flex gap-2">
                    {hairColors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => updateConfig({ hairColor: c.id })}
                        className={`h-8 w-8 rounded-full border-2 transition-all active:scale-95 ${
                          config.hairColor === c.id ? 'border-brand-primary scale-110 shadow' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        aria-label={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {custCategory === 'clothes' && (
              <div className="flex flex-col gap-4">
                {/* Clothes styles */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tipo de Ropa</span>
                  <div className="flex flex-wrap gap-2">
                    {clothingTypes.map((c) => {
                      // Find if any apparel of this type is unlocked
                      const itemsOfType = AVATAR_CATALOG.filter(i => i.category === 'clothing' && i.type === c.id);
                      const hasUnlocked = itemsOfType.some(i => unlockedItemIds.includes(i.id));

                      return (
                        <button
                          key={c.id}
                          disabled={!hasUnlocked}
                          onClick={() => {
                            // Find first unlocked item color to equip
                            const firstUnlocked = itemsOfType.find(i => unlockedItemIds.includes(i.id));
                            if (firstUnlocked) {
                              updateConfig({ clothingType: c.id, clothingColor: firstUnlocked.color as any });
                            }
                          }}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all active:scale-95 flex items-center gap-1 ${
                            config.clothingType === c.id
                              ? 'border-brand-primary bg-brand-primary/5 text-brand-primary dark:border-brand-primaryDark'
                              : !hasUnlocked
                              ? 'border-slate-200 bg-slate-100 text-slate-350 dark:border-slate-850 dark:bg-slate-900/50 cursor-not-allowed'
                              : 'border-slate-250 bg-white text-slate-500 dark:border-slate-850 dark:bg-slate-950'
                          }`}
                        >
                          {!hasUnlocked && <Lock className="h-3 w-3 shrink-0" />}
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clothes colors (equips the current clothing type with selected color, if unlocked!) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Color</span>
                  <div className="flex flex-wrap gap-2">
                    {clothingColors.map((col) => {
                      // Check if current apparel config of this color is unlocked
                      const catalogItem = AVATAR_CATALOG.find(i => i.category === 'clothing' && i.type === config.clothingType && i.color === col.id);
                      const isUnlocked = catalogItem ? unlockedItemIds.includes(catalogItem.id) : false;

                      return (
                        <button
                          key={col.id}
                          disabled={!isUnlocked}
                          onClick={() => updateConfig({ clothingColor: col.id })}
                          className={`h-8 w-8 rounded-full border-2 transition-all active:scale-95 flex items-center justify-center ${
                            config.clothingColor === col.id && isUnlocked ? 'border-brand-primary scale-110 shadow' : 'border-slate-200'
                          } ${!isUnlocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                          style={{ backgroundColor: col.hex }}
                          aria-label={col.label}
                        >
                          {!isUnlocked && <Lock className="h-3.5 w-3.5 text-white stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {custCategory === 'accessories' && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Equipar Accesorios Desbloqueados</span>
                
                <div className="flex flex-col gap-2">
                  {AVATAR_CATALOG.filter(item => item.category === 'accessory' || item.category === 'shoes').map((item) => {
                    const unlocked = unlockedItemIds.includes(item.id);
                    const equipped = isItemCurrentlyEquipped(item);
                    
                    return (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          equipped 
                            ? 'border-brand-primary bg-indigo-50/45 dark:border-brand-primaryDark dark:bg-slate-900'
                            : 'border-slate-100 bg-white/70 dark:border-slate-800 dark:bg-slate-950/20'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                          <span className="text-[9px] text-slate-450 uppercase mt-0.5">{item.category}</span>
                        </div>

                        {equipped ? (
                          <span className="text-[9px] font-black bg-brand-primary text-white dark:bg-brand-primaryDark px-2 py-0.5 rounded-md">
                            EQUIPADO
                          </span>
                        ) : unlocked ? (
                          <button
                            onClick={() => equipItemFromCatalog(item)}
                            className="text-[9px] font-black border-2 border-slate-200 hover:border-slate-350 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 px-3 py-1 rounded-xl text-slate-600 dark:text-slate-350 transition-colors"
                          >
                            EQUIPAR
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                            <Lock className="h-3 w-3 shrink-0" />
                            BLOQUEADO
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SHOP (Virtual Shop) */}
      {activeTab === 'shop' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Shop categories bar */}
          <div className="flex justify-around border-b border-slate-100 pb-2 dark:border-slate-800">
            {[
              { id: 'clothing', label: 'Ropa' },
              { id: 'accessory', label: 'Accesorios' },
              { id: 'shoes', label: 'Calzado' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setShopCategory(cat.id as any)}
                className={`text-xs font-black pb-1.5 border-b-2 transition-all leading-none ${
                  shopCategory === cat.id
                    ? 'border-brand-primary text-brand-primary dark:border-brand-primaryDark dark:text-brand-primaryDark'
                    : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catalog listings */}
          <div className="flex flex-col gap-3">
            {shopItems.map((item) => {
              const unlocked = unlockedItemIds.includes(item.id);
              const isEquipped = isItemCurrentlyEquipped(item);
              
              return (
                <div 
                  key={item.id}
                  className="card-game p-4.5 flex items-center justify-between border border-slate-100 bg-white/80 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex flex-col text-left">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">
                      {item.name}
                    </h3>
                    
                    {/* Item conditions text */}
                    {item.requiredMetric ? (
                      <span className="text-[10px] text-brand-primary dark:text-brand-primaryDark font-bold mt-1.5">
                        🔒 Requisito: {item.requiredMetric.description}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-450 mt-1">
                        Estilo libre para tu ropero virtual.
                      </span>
                    )}
                  </div>

                  {unlocked ? (
                    isEquipped ? (
                      <span className="text-[9px] font-black bg-brand-primary text-white dark:bg-brand-primaryDark px-2.5 py-1 rounded-lg select-none">
                        EQUIPADO
                      </span>
                    ) : (
                      <button
                        onClick={() => equipItemFromCatalog(item)}
                        className="text-[9px] font-black border-2 border-slate-200 px-3 py-1.5 rounded-xl hover:border-slate-350 dark:border-slate-800 dark:text-slate-350 active:scale-95 transition-all bg-white dark:bg-slate-950"
                      >
                        EQUIPAR
                      </button>
                    )
                  ) : item.requiredMetric ? (
                    <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 px-2.5 py-1 rounded-lg select-none uppercase">
                      Desbloqueable
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item.id)}
                      className="btn-game-primary py-2 px-3.5 text-[10px] font-black flex items-center gap-1.5 shrink-0"
                      style={{ boxShadow: 'none' }}
                    >
                      <CircleDollarSign className="h-4 w-4" />
                      <span>{item.coinsCost} mon.</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: REWARDS (Achievements showcase cabinet) */}
      {activeTab === 'rewards' && (
        <div className="flex flex-col gap-3.5 animate-fadeIn">
          {achievements.map((ach) => (
            <div 
              key={ach.id}
              className={`card-game p-4.5 flex items-center gap-4.5 border-2 transition-all relative ${
                ach.isUnlocked 
                  ? 'border-emerald-100 bg-white dark:border-emerald-950/20' 
                  : 'border-slate-200 bg-slate-50/50 dark:border-slate-900/10'
              }`}
            >
              {/* Badge visual icon (Lucide or Trophy) */}
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform ${
                ach.isUnlocked
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-650'
              }`}>
                <Award className="h-6.5 w-6.5 stroke-[2.2]" />
              </div>

              {/* Descriptions */}
              <div className="flex flex-col text-left flex-1 select-none pr-6">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-black leading-tight ${ach.isUnlocked ? 'text-slate-800 dark:text-slate-150' : 'text-slate-550 dark:text-slate-400'}`}>
                    {ach.title}
                  </h3>
                  {ach.isUnlocked && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/20 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-snug mt-1.5">
                  {ach.description}
                </p>

                {/* Reward tokens indicators */}
                <div className="flex gap-2.5 mt-2">
                  <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-500">
                    💰 +{ach.coinsReward} monedas
                  </span>
                  <span className="text-[9px] font-extrabold text-indigo-650 dark:text-indigo-400">
                    🏆 +{ach.xpReward} XP
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
