import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  gradient: string;
  index: number;
}

export const ServiceCard = ({
  icon: Icon,
  title,
  description,
  link,
  gradient,
  index,
}: ServiceCardProps) => {
  return (
    <Link to={link}>
      <Card
        className="glass-card hover-lift cursor-pointer group animate-scale-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardHeader className="text-center">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${gradient} p-4 mb-4 group-hover:shadow-glow transition-all duration-300`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-white text-center transition-colors">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};
