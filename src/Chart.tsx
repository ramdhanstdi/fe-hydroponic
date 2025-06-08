import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Slider } from "antd";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface ChartProps {
  title: string;
  description: string;
  data: {
    time: string[];
    data: { name: string; data: (number | string)[] }[];
  };
}

const Chart: React.FC<ChartProps> = ({ title, description, data }) => {
  const [range, setRange] = useState<[number, number]>([
    0,
    data.time.length - 1,
  ]);
  const [minMax, setMinMax] = useState<[number, number]>([0, 1]);

  const transformChartData = useMemo(() => {
    const filteredLabels = data.time.slice(range[0], range[1] + 1);
    console.log(data.data);

    const filteredDatasets = data.data.map((item) => {
      const isTarget = item.name.toLowerCase().includes("target");

      return {
        label: item.name.toUpperCase(),
        data: item.data.slice(range[0], range[1] + 1).map(Number),
        borderColor: isTarget
          ? "rgba(255, 99, 132, 1)"
          : "rgba(75, 192, 192, 1)",
        backgroundColor: isTarget
          ? "rgba(255, 99, 132, 0.2)"
          : "rgba(75, 192, 192, 0.2)",
        borderDash: isTarget ? [5, 5] : [],
      };
    });

    const allValues = filteredDatasets.flatMap((ds) => ds.data);
    const lowest = Math.min(...allValues);
    const highest = Math.max(...allValues);
    setMinMax([lowest, highest]);

    return {
      labels: filteredLabels,
      datasets: filteredDatasets,
    };
  }, [data, range]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, i) => ({
              text: dataset.label,
              strokeStyle: dataset.borderColor,
              lineWidth: 3,
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
              lineDash: dataset.borderDash || [],
              pointStyle: "line",
            }));
          },
        },
      },
      tooltip: { enabled: true },
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
        },
      },
    },
    scales: {
      y: {
        min: minMax[0] - minMax[0] * 0.01,
        max: minMax[1] + minMax[1] * 0.01,
      },
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div className="w-full p-2">
      <div className="flex justify-between my-2">
        <p className="font-bold text-sm">{title}</p>
      </div>

      <div className="h-64">
        <Line data={transformChartData} options={options} />
      </div>

      <Slider
        range
        min={0}
        max={data.time.length - 1}
        value={range}
        onChange={setRange}
        tooltip={{
          formatter: (value) => {
            const ts = data.time[value];
            return ts ? new Date(ts).toLocaleString() : "";
          },
        }}
      />
    </div>
  );
};

export default Chart;
