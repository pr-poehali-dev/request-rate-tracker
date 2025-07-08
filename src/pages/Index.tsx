import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface DataPoint {
  time: string;
  rps: number;
  timestamp: number;
}

const Index = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentRps, setCurrentRps] = useState(0);
  const [peakRps, setPeakRps] = useState(0);
  const [avgRps, setAvgRps] = useState(0);
  const [nginxStatus, setNginxStatus] = useState<
    "connected" | "disconnected" | "error"
  >("connected");
  const [dbStatus, setDbStatus] = useState<
    "connected" | "disconnected" | "error"
  >("connected");

  // Симулируем получение данных в реальном времени
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Генерируем более плавные данные с синусоидальными колебаниями
      const baseRps = 60;
      const variation = 30;
      const timeOffset = now.getTime() / 10000; // Медленные изменения
      const noise = (Math.random() - 0.5) * 10; // Небольшой шум
      const rps = Math.floor(
        baseRps + Math.sin(timeOffset) * variation + noise,
      );
      const newPoint: DataPoint = {
        time: now.toLocaleTimeString("ru-RU", { hour12: false }),
        rps,
        timestamp: now.getTime(),
      };

      setData((prev) => {
        const newData = [...prev, newPoint].slice(-30); // Храним последние 30 точек
        return newData;
      });

      setCurrentRps(rps);
      setPeakRps((prev) => Math.max(prev, rps));

      // Вычисляем среднее значение
      setData((prev) => {
        if (prev.length > 0) {
          const sum = prev.reduce((acc, point) => acc + point.rps, 0);
          setAvgRps(Math.round(sum / prev.length));
        }
        return prev;
      });

      // Симулируем статус подключений
      setNginxStatus(Math.random() > 0.05 ? "connected" : "error");
      setDbStatus(Math.random() > 0.03 ? "connected" : "error");
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Подключено";
      case "error":
        return "Ошибка";
      default:
        return "Отключено";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            REQUEST MONITOR
          </h1>
          <p className="text-lg text-gray-600">
            Мониторинг запросов в реальном времени
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex justify-center gap-4 mb-6">
          <Badge variant="outline" className="px-4 py-2">
            <div
              className={`w-2 h-2 rounded-full ${getStatusColor(nginxStatus)} mr-2`}
            ></div>
            Nginx: {getStatusText(nginxStatus)}
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            <div
              className={`w-2 h-2 rounded-full ${getStatusColor(dbStatus)} mr-2`}
            ></div>
            База данных: {getStatusText(dbStatus)}
          </Badge>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Текущее RPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {currentRps}
              </div>
              <p className="text-sm text-gray-500 mt-1">запросов/сек</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Пиковое RPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{peakRps}</div>
              <p className="text-sm text-gray-500 mt-1">максимум за сессию</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Среднее RPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{avgRps}</div>
              <p className="text-sm text-gray-500 mt-1">среднее значение</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BarChart3" size={20} />
              Запросы в секунду
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rps"
                    stroke="url(#gradient)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#2563eb", strokeWidth: 2 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    connectNulls={true}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Обновление каждую секунду • Последнее обновление:{" "}
            {new Date().toLocaleTimeString("ru-RU", { hour12: false })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
