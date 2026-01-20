import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTherapistRegistration } from '@/hooks/useTherapistRegistration';
import { CountrySelector } from '@/components/ui/country-selector';
import { Link } from 'react-router-dom';

const LICENSE_TYPES = [
    { value: 'rci', label: 'RCI Licensed (Rehabilitation Council of India)' },
    { value: 'practitioner', label: 'Therapy Practitioner (Unlicensed)' },
    { value: 'lpc', label: 'Licensed Professional Counselor (LPC)' },
    { value: 'lmft', label: 'Licensed Marriage and Family Therapist (LMFT)' },
    { value: 'lcsw', label: 'Licensed Clinical Social Worker (LCSW)' },
    { value: 'psychologist', label: 'Licensed Psychologist (PhD/PsyD)' },
    { value: 'psychiatrist', label: 'Psychiatrist (MD)' },
    { value: 'lmhc', label: 'Licensed Mental Health Counselor (LMHC)' },
    { value: 'other', label: 'Other Licensed Professional' },
];

const EXPERIENCE_OPTIONS = [
    { value: '0-2', label: '0-2 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '11-15', label: '11-15 years' },
    { value: '15+', label: '15+ years' },
];

// Countries list for the selector
const COUNTRIES = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BN', name: 'Brunei' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Greece' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'North Korea' },
    { code: 'KR', name: 'South Korea' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'MX', name: 'Mexico' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MD', name: 'Moldova' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PW', name: 'Palau' },
    { code: 'PS', name: 'Palestine' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russia' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SY', name: 'Syria' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' },
];

const TherapistRegistrationForm = () => {
    const { formData, loading, errors, handleSubmit, updateField } = useTherapistRegistration();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Personal Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                            Full Name *
                        </label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="Dr. Jane Smith"
                            value={formData.fullName}
                            onChange={(e) => updateField('fullName', e.target.value)}
                            disabled={loading}
                            maxLength={100}
                            className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.fullName ? 'border-red-500' : ''}`}
                        />
                        {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                            Email *
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="therapist@example.com"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            disabled={loading}
                            maxLength={255}
                            className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                        Phone Number *
                    </label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        disabled={loading}
                        maxLength={20}
                        className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Professional Credentials</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="licenseType" className="block text-sm font-medium text-white mb-2">
                            License Type *
                        </label>
                        <Select
                            value={formData.licenseType}
                            onValueChange={(value) => updateField('licenseType', value)}
                            disabled={loading}
                        >
                            <SelectTrigger className={`bg-white/5 border-white/20 text-white ${errors.licenseType ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select license type" />
                            </SelectTrigger>
                            <SelectContent>
                                {LICENSE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.licenseType && <p className="text-red-400 text-xs mt-1">{errors.licenseType}</p>}
                    </div>

                    {formData.licenseType !== 'practitioner' && (
                        <div>
                            <label htmlFor="licenseNumber" className="block text-sm font-medium text-white mb-2">
                                License Number *
                            </label>
                            <Input
                                id="licenseNumber"
                                type="text"
                                placeholder="RCI-12345 or LPC-12345"
                                value={formData.licenseNumber}
                                onChange={(e) => updateField('licenseNumber', e.target.value)}
                                disabled={loading}
                                maxLength={50}
                                className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.licenseNumber ? 'border-red-500' : ''}`}
                            />
                            {errors.licenseNumber && <p className="text-red-400 text-xs mt-1">{errors.licenseNumber}</p>}
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-white mb-2">
                            Years of Experience *
                        </label>
                        <Select
                            value={formData.yearsOfExperience}
                            onValueChange={(value) => updateField('yearsOfExperience', value)}
                            disabled={loading}
                        >
                            <SelectTrigger className={`bg-white/5 border-white/20 text-white ${errors.yearsOfExperience ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPERIENCE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.yearsOfExperience && <p className="text-red-400 text-xs mt-1">{errors.yearsOfExperience}</p>}
                    </div>

                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-white mb-2">
                            Country *
                        </label>
                        <CountrySelector
                            countries={COUNTRIES}
                            value={formData.country}
                            onValueChange={(value) => updateField('country', value)}
                            disabled={loading}
                        />
                        {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-white mb-2">
                        State/Province (if applicable)
                    </label>
                    <Input
                        id="state"
                        type="text"
                        placeholder="California"
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        disabled={loading}
                        maxLength={100}
                        className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.state ? 'border-red-500' : ''}`}
                    />
                    {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                    <label htmlFor="specializations" className="block text-sm font-medium text-white mb-2">
                        Specializations *
                    </label>
                    <Textarea
                        id="specializations"
                        placeholder="e.g., Anxiety, Depression, PTSD, Couples Therapy, CBT, DBT..."
                        value={formData.specializations}
                        onChange={(e) => updateField('specializations', e.target.value)}
                        disabled={loading}
                        rows={3}
                        maxLength={500}
                        className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none ${errors.specializations ? 'border-red-500' : ''}`}
                    />
                    {errors.specializations && <p className="text-red-400 text-xs mt-1">{errors.specializations}</p>}
                    <p className="text-white/40 text-xs mt-1 text-right">{formData.specializations.length}/500</p>
                </div>
            </div>

            {/* Bio and Links */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">About You</h3>
                
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
                        Professional Bio *
                    </label>
                    <Textarea
                        id="bio"
                        placeholder="Tell us about your approach to therapy, your background, and what clients can expect when working with you..."
                        value={formData.bio}
                        onChange={(e) => updateField('bio', e.target.value)}
                        disabled={loading}
                        rows={5}
                        maxLength={1000}
                        className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none ${errors.bio ? 'border-red-500' : ''}`}
                    />
                    {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio}</p>}
                    <p className="text-white/40 text-xs mt-1 text-right">{formData.bio.length}/1000</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
                            Website (optional)
                        </label>
                        <Input
                            id="website"
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={formData.website}
                            onChange={(e) => updateField('website', e.target.value)}
                            disabled={loading}
                            className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.website ? 'border-red-500' : ''}`}
                        />
                        {errors.website && <p className="text-red-400 text-xs mt-1">{errors.website}</p>}
                    </div>

                    <div>
                        <label htmlFor="linkedIn" className="block text-sm font-medium text-white mb-2">
                            LinkedIn (optional)
                        </label>
                        <Input
                            id="linkedIn"
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={formData.linkedIn}
                            onChange={(e) => updateField('linkedIn', e.target.value)}
                            disabled={loading}
                            className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 ${errors.linkedIn ? 'border-red-500' : ''}`}
                        />
                        {errors.linkedIn && <p className="text-red-400 text-xs mt-1">{errors.linkedIn}</p>}
                    </div>
                </div>
            </div>

            {/* Terms Agreement */}
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => updateField('agreeToTerms', checked as boolean)}
                        disabled={loading}
                        className="mt-1"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-white/80 cursor-pointer">
                        I agree to the <Link to="/terms" className="text-purple-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>. I confirm that all information provided is accurate and that I hold a valid license to practice therapy. *
                    </label>
                </div>
                {errors.agreeToTerms && <p className="text-red-400 text-xs">{errors.agreeToTerms}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
                <a
                    href="mailto:founder@theeverythingai.com"
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Questions? founder@theeverythingai.com</span>
                </a>
                <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Registration'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default TherapistRegistrationForm;
