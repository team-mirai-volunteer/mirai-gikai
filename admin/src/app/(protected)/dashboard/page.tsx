import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Users, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">みらい議会の管理画面へようこそ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">議案数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">総議案数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">政党スタンス</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">表明済み</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理者</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">アクティブユーザー</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">システム状態</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">正常</div>
            <p className="text-xs text-muted-foreground">
              すべてのサービスが稼働中
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近の議案</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Suspense fallback={<div>Loading...</div>}>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">地方自治法改正案</p>
                    <p className="text-xs text-muted-foreground">
                      衆議院総務委員会で審議中
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      学校給食無償化促進法案
                    </p>
                    <p className="text-xs text-muted-foreground">
                      両院で可決、4月から実施
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      こども家庭庁予算増額法案
                    </p>
                    <p className="text-xs text-muted-foreground">
                      参議院で可決、衆議院へ送付
                    </p>
                  </div>
                </div>
              </Suspense>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>政党スタンス概要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">賛成</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-green-200 rounded-full">
                    <div className="w-3/5 h-2 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-xs text-muted-foreground">3件</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">反対</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-red-200 rounded-full">
                    <div className="w-1/5 h-2 bg-red-500 rounded-full" />
                  </div>
                  <span className="text-xs text-muted-foreground">1件</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">中立</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/5 h-2 bg-gray-500 rounded-full" />
                  </div>
                  <span className="text-xs text-muted-foreground">1件</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
