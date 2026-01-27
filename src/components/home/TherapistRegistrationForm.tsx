import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Sparkles, Loader2 } from "lucide-react";
import { useTherapistRegistration } from "@/hooks/useTherapistRegistration";

export const TherapistRegistrationForm = () => {
  const { formData, loading, handleSubmit, updateField } =
    useTherapistRegistration();

  return (
    <Card className="glass-card animate-fade-in">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white mb-2"
              >
                Full Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. Jane Smith"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                disabled={loading}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jane.smith@example.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                disabled={loading}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-white mb-2"
              >
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                disabled={loading}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label
                htmlFor="yearsOfExperience"
                className="block text-sm font-medium text-white mb-2"
              >
                Years of Experience *
              </label>
              <Input
                id="yearsOfExperience"
                type="number"
                placeholder="5"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  updateField("yearsOfExperience", e.target.value)
                }
                required
                disabled={loading}
                min="0"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-white mb-2"
              >
                Specialization/Expertise *
              </label>
              <Input
                id="specialization"
                type="text"
                placeholder="e.g., CBT, Anxiety, Depression"
                value={formData.specialization}
                onChange={(e) => updateField("specialization", e.target.value)}
                required
                disabled={loading}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label
                htmlFor="licenseNumber"
                className="block text-sm font-medium text-white mb-2"
              >
                License Number
              </label>
              <Input
                id="licenseNumber"
                type="text"
                placeholder="License #"
                value={formData.licenseNumber}
                onChange={(e) => updateField("licenseNumber", e.target.value)}
                disabled={loading}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-white mb-2"
            >
              Tell us about yourself *
            </label>
            <Textarea
              id="message"
              placeholder="Share your experience, approach to therapy, and why you'd like to join our platform..."
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              required
              disabled={loading}
              rows={6}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-white/70">
              <Stethoscope className="w-5 h-5" />
              <span className="text-sm">
                Join our network of professional therapists
              </span>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="bg-gradient-primary hover:shadow-glow w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
