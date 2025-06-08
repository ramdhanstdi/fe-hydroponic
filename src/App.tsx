import { useEffect, useState } from "react";
import { DatePicker, ConfigProvider, message } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "antd/dist/reset.css";
import "./App.css";
import Chart from "./Chart";

dayjs.extend(utc);

function App() {
  const [data, setData] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState(dayjs());
  const [dateTo, setDateTo] = useState(dayjs());
  const [ppm, setPpm] = useState({
    time: [],
    data: { name: "ppm", data: [] },
  });
  const [light, setLight] = useState({
    time: [],
    data: { name: "light", data: [] },
  });
  const [temperature, setTemperature] = useState({
    time: [],
    data: { name: "temperature", data: [] },
  });
  const [humidity, setHumidity] = useState({
    time: [],
    data: { name: "humidity", data: [] },
  });

  const fetchData = async (from: string, to: string) => {
    try {
      const response = await fetch(
        `https://be-hydroponic.vercel.app/hydroponics?from=${from}&to=${to}`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      const time = result.map((item) => item.created_at);

      const ppmData = result.map((item) => item.ppm);
      const lightData = result.map((item) => item.light);
      const temperatureData = result.map((item) => item.temperature);
      const humidityData = result.map((item) => item.humidity);

      const finalChartData = {
        time,
        data: [
          { name: "ppm", data: ppmData },
          { name: "light", data: lightData },
          { name: "temperature", data: temperatureData },
          { name: "humidity", data: humidityData },
        ],
      };

      setPpm(finalChartData);
      setLight(light);
      setTemperature(temperature);
      setHumidity(humidity);
      setData(result);
    } catch (error) {
      message.error("Fetch failed: " + error);
    }
  };

  useEffect(() => {
    const from = dateFrom.startOf("day").toISOString();
    const to = dateTo.endOf("day").toISOString();
    fetchData(from, to);
  }, [dateFrom, dateTo]);
  return (
    <ConfigProvider>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="font-semibold block">From Date:</label>
            <DatePicker
              value={dateFrom}
              onChange={(date) => date && setDateFrom(date)}
              format="YYYY-MM-DD"
            />
          </div>
          <div>
            <label className="font-semibold block">To Date:</label>
            <DatePicker
              value={dateTo}
              onChange={(date) => date && setDateTo(date)}
              format="YYYY-MM-DD"
            />
          </div>
        </div>

        {data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-300 rounded-xl shadow-md p-4 text-gray-800">
                <p className="text-2xl font-bold">PPM</p>
                <p className="text-xl">{data[data.length - 1]?.ppm}</p>
              </div>
              <div className="bg-blue-300 rounded-xl shadow-md p-4 text-gray-800">
                <p className="text-2xl font-bold">Humidity</p>
                <p className="text-xl">{data[data.length - 1]?.humidity}</p>
              </div>
              <div className="bg-blue-300 rounded-xl shadow-md p-4 text-gray-800">
                <p className="text-2xl font-bold">Temperature</p>
                <p className="text-xl">{data[data.length - 1]?.temperature}</p>
              </div>
              <div className="bg-blue-300 rounded-xl shadow-md p-4 text-gray-800">
                <p className="text-2xl font-bold">Light</p>
                <p className="text-xl">{data[data.length - 1]?.light}</p>
              </div>
            </div>
          </>
        ) : (
          <p>No data found for selected dates.</p>
        )}
        {ppm.time.length > 0 && (
          <div className="space-y-4">
            <Chart
              title="PPM Levels"
              description="Lower is better"
              data={ppm}
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
