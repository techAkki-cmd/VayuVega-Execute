import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const EmailVerification = () => {
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();
  const { signUp } = useSupabaseAuth();

  useEffect(() => {
    // Get form data from sessionStorage
    const storedData = sessionStorage.getItem('signupFormData');
    if (!storedData) {
      // If no form data exists, redirect back to signup form
      toast.error("Please complete the signup form first");
      navigate("/signup");
      return;
    }
    setFormData(JSON.parse(storedData));
  }, [navigate]);

  const handleLoginClick = () => {
    // Clear stored form data
    sessionStorage.removeItem('signupFormData');
    navigate("/login");
  };

  if (!formData) {
    return null; // Don't render until data is loaded or redirect happens
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
        </div>
        <CardDescription className="text-center space-y-2">
          <p>We've sent a verification link to:</p>
          <p className="font-medium text-primary">{formData.email}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Click the link in your email to verify your account. After verification, you can log in to access your account.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <Button 
          onClick={handleLoginClick}
          className="w-full"
        >
          Go to Login
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Didn't receive the email?{" "}
          <button 
            onClick={() => signUp(formData.email, formData.password)}
            className="text-sm font-medium underline-offset-4 hover:underline"
            type="button"
          >
            Click here to resend
          </button>
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="ghost" 
          className="text-sm"
          onClick={() => navigate("/signup")}
        >
          Back to sign up
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailVerification;
