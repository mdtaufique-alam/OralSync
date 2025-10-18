"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";

export default function CustomPricingTable() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with basic dental care",
      features: [
        "3 AI consultations per month",
        "Basic dental health tracking",
        "Appointment booking",
        "Email support",
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Unlimited AI consultations and advanced features",
      features: [
        "Unlimited AI consultations",
        "Advanced dental health analytics",
        "Priority appointment booking",
        "Voice AI assistant access",
        "24/7 priority support",
        "Custom dental care plans",
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For dental practices and organizations",
      features: [
        "Everything in Pro",
        "Multi-user management",
        "Custom integrations",
        "Dedicated account manager",
        "Custom AI training",
        "White-label options",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative ${
            plan.popular
              ? "border-primary shadow-lg scale-105"
              : "border-border"
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                <Crown className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground ml-1">/{plan.period}</span>
            </div>
            <CardDescription className="mt-2">{plan.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.buttonVariant}
              size="lg"
              disabled={plan.name === "Free"}
            >
              {plan.name === "Pro" && <Zap className="w-4 h-4 mr-2" />}
              {plan.buttonText}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
