import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Brain, Sparkles, LogIn, UserPlus, Snowflake, CloudRain, Leaf, Flower2, Bug, PartyPopper, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import SnowEffect from '@/components/effects/SnowEffect';
import RainEffect from '@/components/effects/RainEffect';
import { FallingLeavesEffect } from '@/components/effects/FallingLeavesEffect';
import { CherryBlossomEffect } from '@/components/effects/CherryBlossomEffect';
import { FirefliesEffect } from '@/components/effects/FirefliesEffect';
import { ConfettiEffect } from '@/components/effects/ConfettiEffect';

type EffectType = 'none' | 'snow' | 'rain' | 'leaves' | 'blossoms' | 'fireflies' | 'confetti';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeEffect, setActiveEffect] = useState<EffectType>('none');
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
    { id: 'snow' as EffectType, label: 'Let it Snow', icon: Snowflake, color: 'text-sky-400' },
    { id: 'rain' as EffectType, label: 'Let it Rain', icon: CloudRain, color: 'text-blue-400' },
    { id: 'leaves' as EffectType, label: 'Falling Leaves', icon: Leaf, color: 'text-orange-400' },
    { id: 'blossoms' as EffectType, label: 'Cherry Blossoms', icon: Flower2, color: 'text-pink-400' },
    { id: 'fireflies' as EffectType, label: 'Fireflies', icon: Bug, color: 'text-yellow-400' },
    { id: 'confetti' as EffectType, label: 'Confetti', icon: PartyPopper, color: 'text-purple-400' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleEffect = (effect: EffectType) => {
    setActiveEffect(activeEffect === effect ? 'none' : effect);
  };

  const getActiveEffectIcon = () => {
    const active = effectOptions.find(e => e.id === activeEffect);
    return active ? active.icon : Palette;
  };

  const getActiveEffectColor = () => {
    const active = effectOptions.find(e => e.id === activeEffect);
    return active ? active.color : 'text-muted-foreground';
  };

  const ActiveIcon = getActiveEffectIcon();

  return (
    <>
      <SnowEffect enabled={activeEffect === 'snow'} />
      <RainEffect enabled={activeEffect === 'rain'} />
      <FallingLeavesEffect enabled={activeEffect === 'leaves'} />
      <CherryBlossomEffect enabled={activeEffect === 'blossoms'} />
      <FirefliesEffect enabled={activeEffect === 'fireflies'} />
      <ConfettiEffect enabled={activeEffect === 'confetti'} />
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover-lift">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#8A2BE2] to-[#FF8C00] bg-clip-text text-transparent">
                The Everything AI
              </span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Seasonal Effects Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-all duration-300 h-8 w-8 ${activeEffect !== 'none' ? `${getActiveEffectColor()} bg-current/20` : 'text-muted-foreground hover:text-foreground'}`}
                  title="Seasonal Effects"
                >
                  <ActiveIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {effectOptions.map((effect) => (
                  <DropdownMenuItem
                    key={effect.id}
                    onClick={() => toggleEffect(effect.id)}
                    className={`cursor-pointer flex items-center gap-2 ${activeEffect === effect.id ? effect.color : ''}`}
                  >
                    <effect.icon className={`w-4 h-4 ${activeEffect === effect.id ? effect.color : ''}`} />
                    {effect.label}
                    {activeEffect === effect.id && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
                {activeEffect !== 'none' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setActiveEffect('none')}
                      className="cursor-pointer text-muted-foreground"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Turn Off
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
              {/* Mobile Effects Selector */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-glass-border">
                {effectOptions.map((effect) => (
                  <Button
                    key={effect.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEffect(effect.id)}
                    className={`transition-all duration-300 ${activeEffect === effect.id ? `${effect.color} bg-current/20` : 'text-muted-foreground'}`}
                  >
                    <effect.icon className="w-4 h-4 mr-1" />
                    {effect.label.split(' ')[0]}
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
