import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            管理者ログイン
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            みらい議会 Admin Dashboard
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 政党チームみらい. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
