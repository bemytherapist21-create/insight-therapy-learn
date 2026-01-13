import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles, LogIn, UserPlus, Snowflake, CloudRain, Leaf, Flower2, Bug, PartyPopper, Heart, Star, CloudLightning, Volume2, VolumeX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import SnowEffect from '@/components/effects/SnowEffect';
import RainEffect from '@/components/effects/RainEffect';
import { FallingLeavesEffect } from '@/components/effects/FallingLeavesEffect';
import { CherryBlossomEffect } from '@/components/effects/CherryBlossomEffect';
import { FirefliesEffect } from '@/components/effects/FirefliesEffect';
import { ConfettiEffect } from '@/components/effects/ConfettiEffect';
import { BatsEffect } from '@/components/effects/BatsEffect';
import { HeartsEffect } from '@/components/effects/HeartsEffect';
import { StarfieldEffect } from '@/components/effects/StarfieldEffect';
import { ThunderstormEffect } from '@/components/effects/ThunderstormEffect';
import { ambientSoundService } from '@/services/ambientSoundService';
import brainLogo from '@/assets/brain-logo.png';

type EffectType = 'none' | 'snow' | 'rain' | 'leaves' | 'blossoms' | 'fireflies' | 'confetti' | 'bats' | 'hearts' | 'stars' | 'storm';

// Map effects to their corresponding sounds
const effectSoundMap: Record<EffectType, (() => void) | null> = {
  none: null,
  snow: () => ambientSoundService.startWind(),
  rain: () => ambientSoundService.startRain(),
  leaves: () => ambientSoundService.startWind(),
  blossoms: () => ambientSoundService.startWind(),
  fireflies: () => ambientSoundService.startNightAmbient(),
  confetti: () => ambientSoundService.startParty(),
  bats: () => ambientSoundService.startSpooky(),
  hearts: () => ambientSoundService.startHeartbeat(),
  stars: () => ambientSoundService.startSparkle(),
  storm: () => {
    ambientSoundService.startRain();
    // Play thunder occasionally
    const thunderInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        ambientSoundService.playThunder();
      }
    }, 3000);
    (window as any).__thunderInterval = thunderInterval;
  },
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeEffect, setActiveEffect] = useState<EffectType>('none');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  const effectOptions = [
    { id: 'leaves' as EffectType, label: 'Autumn', icon: Leaf, color: 'text-orange-400', bg: 'bg-orange-400/20' },
    { id: 'blossoms' as EffectType, label: 'Spring', icon: Flower2, color: 'text-pink-400', bg: 'bg-pink-400/20' },
    { id: 'fireflies' as EffectType, label: 'Summer', icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
    { id: 'bats' as EffectType, label: 'Halloween', icon: Bug, color: 'text-purple-500', bg: 'bg-purple-500/20' },
    { id: 'hearts' as EffectType, label: 'Valentine', icon: Heart, color: 'text-red-400', bg: 'bg-red-400/20' },
    { id: 'confetti' as EffectType, label: 'Party', icon: PartyPopper, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
    { id: 'snow' as EffectType, label: 'Snow', icon: Snowflake, color: 'text-sky-400', bg: 'bg-sky-400/20' },
    { id: 'rain' as EffectType, label: 'Rain', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { id: 'stars' as EffectType, label: 'Night', icon: Star, color: 'text-indigo-300', bg: 'bg-indigo-300/20' },
    { id: 'storm' as EffectType, label: 'Storm', icon: CloudLightning, color: 'text-slate-300', bg: 'bg-slate-300/20' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Stop all sounds when effect changes or sound is disabled
  const stopAllSounds = useCallback(() => {
    ambientSoundService.stopAll();
    if ((window as any).__thunderInterval) {
      clearInterval((window as any).__thunderInterval);
      (window as any).__thunderInterval = null;
    }
  }, []);

  // Handle sound for current effect
  useEffect(() => {
    if (!soundEnabled || activeEffect === 'none') {
      stopAllSounds();
      return;
    }

    stopAllSounds();
    const startSound = effectSoundMap[activeEffect];
    if (startSound) {
      startSound();
    }

    return () => {
      stopAllSounds();
    };
  }, [activeEffect, soundEnabled, stopAllSounds]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleEffect = (effect: EffectType) => {
    setActiveEffect(activeEffect === effect ? 'none' : effect);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <>
      <SnowEffect enabled={activeEffect === 'snow'} />
      <RainEffect enabled={activeEffect === 'rain'} />
      <FallingLeavesEffect enabled={activeEffect === 'leaves'} />
      <CherryBlossomEffect enabled={activeEffect === 'blossoms'} />
      <FirefliesEffect enabled={activeEffect === 'fireflies'} />
      <ConfettiEffect enabled={activeEffect === 'confetti'} />
      <BatsEffect enabled={activeEffect === 'bats'} />
      <HeartsEffect enabled={activeEffect === 'hearts'} />
      <StarfieldEffect enabled={activeEffect === 'stars'} />
      <ThunderstormEffect enabled={activeEffect === 'storm'} />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover-lift">
              <img src={brainLogo} alt="The Everything AI Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#8A2BE2] to-[#FF8C00] bg-clip-text text-transparent">
                The Everything AI
              </span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              className={`h-7 w-7 transition-all duration-300 ${
                soundEnabled 
                  ? 'text-primary bg-primary/20' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </Button>

            {/* Seasonal Effects Row */}
            <div className="flex items-center gap-0.5 bg-background/50 rounded-lg p-1">
              {effectOptions.map((effect) => (
                <Button
                  key={effect.id}
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleEffect(effect.id)}
                  className={`transition-all duration-300 h-7 w-7 ${
                    activeEffect === effect.id 
                      ? `${effect.color} ${effect.bg}` 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={effect.label}
                >
                  <effect.icon className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative transition-all duration-300 ${isActive(item.path)
                  ? 'text-primary font-semibold'
                  : 'text-foreground hover:text-primary'
                  }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full" />
                )}
              </Link>
            ))}

            {user ? (
              <Button
                variant="default"
                className="bg-gradient-primary hover:shadow-glow"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="bg-gradient-primary hover:shadow-glow">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)} className="cursor-pointer">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/register')} className="cursor-pointer">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-glass-border">
            <div className="flex flex-col gap-4 pt-4">
              {/* Mobile Sound Toggle and Effects Selector */}
              <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-glass-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  className={`h-8 px-2 ${
                    soundEnabled 
                      ? 'text-primary bg-primary/20' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 mr-1" /> : <VolumeX className="w-3.5 h-3.5 mr-1" />}
                  <span className="text-xs">{soundEnabled ? 'On' : 'Off'}</span>
                </Button>
                {effectOptions.map((effect) => (
                  <Button
                    key={effect.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEffect(effect.id)}
                    className={`transition-all duration-300 h-8 px-2 ${
                      activeEffect === effect.id 
                        ? `${effect.color} ${effect.bg}` 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <effect.icon className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">{effect.label}</span>
                  </Button>
                ))}
              </div>
              
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`py-2 transition-colors ${isActive(item.path)
                    ? 'text-primary font-semibold'
                    : 'text-foreground hover:text-primary'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <Button
                  variant="default"
                  className="bg-gradient-primary w-full mt-2"
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Button
                    variant="default"
                    className="bg-gradient-primary w-full"
                    onClick={() => {
                      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                      setIsOpen(false);
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-foreground hover:bg-white/10"
                    onClick={() => {
                      navigate('/register');
                      setIsOpen(false);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
