import React from "react";
import sizeChartImg from "@/assets/size-chart.jpg"; // ✅ Replace with your actual image path

const SizeChart = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Size Chart</h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
        Use this size chart as a guide to find your perfect fit. Measurements are in inches and may vary slightly by style.
      </p>

      {/* 🧍 Image Section */}
      <div className="flex justify-center mb-10">
        <img
          src={sizeChartImg}
          alt="Size Chart Guide"
          className="max-w-full rounded-xl shadow-md w-full md:w-2/3"
        />
      </div>

      {/* 📏 Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg text-sm md:text-base">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">Size</th>
              <th className="px-4 py-3 text-left">UK</th>
              <th className="px-4 py-3 text-left">Bust (inches)</th>
              <th className="px-4 py-3 text-left">Waist (inches)</th>
              <th className="px-4 py-3 text-left">Hips (inches)</th>
              <th className="px-4 py-3 text-left">Inside Leg (inches)</th>
              <th className="px-4 py-3 text-left">Sleeve (inches)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { size: "XXS–XS", uk: "4", bust: "30–31", waist: "24–25", hips: "33–35", leg: "28", sleeve: "23" },
              { size: "XS", uk: "6", bust: "31–32", waist: "25–26", hips: "35–36", leg: "28", sleeve: "23" },
              { size: "S", uk: "8", bust: "33–34", waist: "26–28", hips: "37–37", leg: "28", sleeve: "24" },
              { size: "M", uk: "10", bust: "34–35", waist: "28–29", hips: "38–39", leg: "29", sleeve: "24" },
              { size: "L", uk: "12", bust: "35–36", waist: "30–30", hips: "39–40", leg: "29", sleeve: "25" },
              { size: "XL", uk: "14", bust: "37–37", waist: "31–31", hips: "40–41", leg: "30", sleeve: "25" },
              { size: "XXL", uk: "16", bust: "37–38", waist: "31–32", hips: "41–42", leg: "31", sleeve: "26" },
            ].map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{row.size}</td>
                <td className="px-4 py-3">{row.uk}</td>
                <td className="px-4 py-3">{row.bust}</td>
                <td className="px-4 py-3">{row.waist}</td>
                <td className="px-4 py-3">{row.hips}</td>
                <td className="px-4 py-3">{row.leg}</td>
                <td className="px-4 py-3">{row.sleeve}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Still unsure? Contact us via WhatsApp or Instagram — we’ll help you choose the perfect size.
      </p>
    </div>
  );
};

export default SizeChart;
