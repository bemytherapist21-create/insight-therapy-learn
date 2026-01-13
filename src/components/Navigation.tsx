import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Brain, Sparkles, LogIn, UserPlus, Snowflake } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import SnowEffect from '@/components/effects/SnowEffect';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [snowEnabled, setSnowEnabled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <SnowEffect enabled={snowEnabled} />
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Snow Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSnowEnabled(!snowEnabled)}
                className={`transition-all duration-300 ${snowEnabled ? 'text-sky-400 bg-sky-400/20' : 'text-muted-foreground hover:text-foreground'}`}
                title="Let it Snow!"
              >
                <Snowflake className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2 hover-lift">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#8A2BE2] to-[#FF8C00] bg-clip-text text-transparent">
                  The Everything AI
                </span>
              </Link>
            </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
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
