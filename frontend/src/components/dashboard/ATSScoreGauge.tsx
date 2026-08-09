import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"

interface ATSScoreGaugeProps {
  score: number
}

export function ATSScoreGauge({ score }: ATSScoreGaugeProps) {
  const color =
    score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444"

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={200} height={200}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          barSize={12}
          data={[{ value: score, fill: color }]}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "#e5e7eb" }}
            dataKey="value"
            cornerRadius={6}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="mt-[-80px] text-center">
        <div className="text-4xl font-bold" style={{ color }}>
          {Math.round(score)}
        </div>
        <div className="text-sm text-muted-foreground">ATS Score</div>
      </div>
    </div>
  )
}
