import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const competitors = [
  { name: "FormD", column: "formd" },
  { name: "Typeform", column: "typeform" },
  { name: "Google Forms", column: "google" },
  { name: "SurveyMonkey", column: "survey" },
];

const features = [
  {
    name: "AI Form Generation",
    formd: true,
    typeform: false,
    google: false,
    survey: false,
  },
  {
    name: "AI Response Analysis",
    formd: true,
    typeform: false,
    google: false,
    survey: true,
  },
  {
    name: "Beautiful Design",
    formd: true,
    typeform: true,
    google: false,
    survey: false,
  },
  {
    name: "Advanced Logic",
    formd: true,
    typeform: true,
    google: false,
    survey: true,
  },
  {
    name: "Real-time Analytics",
    formd: true,
    typeform: true,
    google: true,
    survey: true,
  },
  {
    name: "Custom Branding",
    formd: true,
    typeform: true,
    google: false,
    survey: true,
  },
  {
    name: "Unlimited Responses (Free)",
    formd: true,
    typeform: false,
    google: true,
    survey: false,
  },
  {
    name: "Payment Collection",
    formd: true,
    typeform: true,
    google: false,
    survey: false,
  },
];

export function ComparisonSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Comparison
          </Badge>
          <h2 className="text-5xl font-bold mb-4">
            Why choose Form<span className="italic">D</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how we stack up against the competition
          </p>
        </div>

        <div className="max-w-5xl mx-auto overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead className="w-[250px] font-bold text-base">
                  Feature
                </TableHead>
                {competitors.map((competitor) => (
                  <TableHead
                    key={competitor.column}
                    className="text-center font-bold text-base"
                  >
                    {competitor.name === "FormD" ? (
                      <Badge
                        variant="default"
                        className="bg-indigo-600 dark:bg-indigo-600"
                      >
                        Form<span className="italic">D</span>
                      </Badge>
                    ) : (
                      competitor.name
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell className="text-center">
                    {feature.formd ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {feature.typeform ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {feature.google ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {feature.survey ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
