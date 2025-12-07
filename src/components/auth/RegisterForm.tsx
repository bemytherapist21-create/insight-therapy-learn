import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useRegister } from '@/hooks/useRegister';
import { calculatePasswordStrength } from '@/lib/validation';

export const RegisterForm = () => {
    const { formData, loading, countries, errors, autoDetectedCountry, updateField, handleSubmit } = useRegister();
    const passwordStrength = calculatePasswordStrength(formData.password);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        disabled={loading}
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        disabled={loading}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        disabled={loading}
                    />
                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="mt-1">
                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-300"
                                    style={{
                                        width: `${(passwordStrength.score + 1) * 20}%`,
                                        backgroundColor: passwordStrength.color
                                    }}
                                />
                            </div>
                            <p className="text-xs mt-1 text-right" style={{ color: passwordStrength.color }}>
                                {passwordStrength.label}
                            </p>
                        </div>
                    )}
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        disabled={loading}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        required
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        disabled={loading}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                {/* Country */}
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                        value={formData.country}
                        onValueChange={(value) => updateField('country', value)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                    {country.name}{autoDetectedCountry === country.code ? ' (Auto Detected)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="age"
                        checked={formData.ageConfirmed}
                        onCheckedChange={(checked) => updateField('ageConfirmed', checked === true)}
                        disabled={loading}
                    />
                    <label htmlFor="age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I confirm I am 18 years or older
                    </label>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => updateField('termsAccepted', checked === true)}
                        disabled={loading}
                    />
                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I accept the <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link>
                    </label>
                </div>

                {(errors.ageConfirmed || errors.termsAccepted) && (
                    <p className="text-sm text-red-500">Please confirm age and accept terms.</p>
                )}
            </div>

            <Button className="w-full mt-6" type="submit" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                    </>
                ) : (
                    "Create Account"
                )}
            </Button>
        </form>
    );
};
