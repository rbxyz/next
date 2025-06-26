"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function SignInForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = api.auth.signIn.useMutation({
    onSuccess: () => {
      // Use window.location to ensure cookies are properly set before navigation
      window.location.href = "/workspaces";
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  const onSubmit = (data: FormValues) => {
    setServerError(null);
    signInMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-gray-500">
          Enter your credentials to access your account.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {serverError}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            disabled={signInMutation.isPending}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...form.register("password")}
            disabled={signInMutation.isPending}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending ? "Signing In..." : "Sign In"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}