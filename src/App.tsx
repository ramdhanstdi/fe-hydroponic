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

  const singleData = async (from: string, to: string) => {
    try {
      const response = await fetch(
        `https://be-hydroponic.vercel.app/hydroponics?from=${from}&to=${to}`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.log(error);
    }
  };

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

      const ppm = {
        time,
        data: [{ name: "ppm", data: ppmData }],
      };
      const light = {
        time,
        data: [{ name: "light", data: lightData }],
      };
      const temperature = {
        time,
        data: [{ name: "temperature", data: temperatureData }],
      };
      const humidity = {
        time,
        data: [{ name: "humidity", data: humidityData }],
      };

      setPpm(ppm);
      setLight(light);
      setTemperature(temperature);
      setHumidity(humidity);
    } catch (error) {
      message.error("Fetch failed: " + error);
    }
  };

  useEffect(() => {
    const from = dateFrom.startOf("day").toISOString();
    const to = dateTo.endOf("day").toISOString();
    fetchData(from, to);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const from = dateFrom.startOf("day").toISOString();
    const to = dateTo.endOf("day").toISOString();
    singleData(from, to);
  }, []);
  return (
    <ConfigProvider>
      <div className="p-4 space-y-4">
        {data.length > 0 ? (
          <>
            <p className="text-2xl font-bold">Data Terakhir yang di dapatkan</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-300 rounded-xl shadow-md p-4 text-gray-800">
                <p className="text-2xl font-bold">PPM</p>
                <p className="text-xl">{data[data.length - 1]?.ppm} ppm</p>
              </div>
              <div className="bg-blue-300 rounded-xl shadow-md p-4 text-gray-800">
                <p className="text-2xl font-bold">Humidity</p>
                <p className="text-xl">{data[data.length - 1]?.humidity} %</p>
              </div>
              <div className="bg-blue-300 rounded-xl shadow-md p-4 text-gray-800">
                <p className="text-2xl font-bold">Temperature</p>
                <p className="text-xl">
                  {data[data.length - 1]?.temperature} C
                </p>
              </div>
              <div className="bg-blue-300 rounded-xl shadow-md p-4 text-gray-800">
                <p className="text-2xl font-bold">Light</p>
                <p className="text-xl">{data[data.length - 1]?.light} Lux</p>
              </div>
            </div>
          </>
        ) : (
          <p>No data found for selected dates.</p>
        )}
        {ppm.time.length > 0 && (
          <div className="mt-6">
            <p className="text-2xl font-bold ">Data Grafik</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Chart title="PPM Levels" data={ppm} />
              <Chart title="Light Levels" data={light} />
              <Chart title="Temperature Levels" data={temperature} />
              <Chart title="Humidity Levels" data={humidity} />
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
