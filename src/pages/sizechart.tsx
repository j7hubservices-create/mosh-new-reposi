import React from "react";
import sizeChartImg from "@/assets/size-chart.jpg"; // 👈 replace with your actual image path

const SizeChart = () => {
  return (
    <div className="container mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center">Size Chart</h1>

      {/* Size Chart Image */}
      <div className="flex justify-center mb-10">
        <img
          src={sizeChartImg}
          alt="Size Chart"
          className="w-full max-w-3xl rounded-2xl shadow-md"
        />
      </div>

      {/* Size Chart Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">SIZE</th>
              <th className="border px-4 py-2">UK</th>
              <th className="border px-4 py-2">BUST (inches)</th>
              <th className="border px-4 py-2">WAIST (inches)</th>
              <th className="border px-4 py-2">HIPS (inches)</th>
              <th className="border px-4 py-2">INSIDE LEG (inches)</th>
              <th className="border px-4 py-2">SLEEVE (inches)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2 font-semibold">XXS–XS</td>
              <td className="border px-4 py-2">4</td>
              <td className="border px-4 py-2">30–31</td>
              <td className="border px-4 py-2">24–25</td>
              <td className="border px-4 py-2">33–35</td>
              <td className="border px-4 py-2">28</td>
              <td className="border px-4 py-2">23</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">XS</td>
              <td className="border px-4 py-2">6</td>
              <td className="border px-4 py-2">31–32</td>
              <td className="border px-4 py-2">25–26</td>
              <td className="border px-4 py-2">35–36</td>
              <td className="border px-4 py-2">28</td>
              <td className="border px-4 py-2">23</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">S</td>
              <td className="border px-4 py-2">8</td>
              <td className="border px-4 py-2">33–34</td>
              <td className="border px-4 py-2">26–28</td>
              <td className="border px-4 py-2">37–37</td>
              <td className="border px-4 py-2">28</td>
              <td className="border px-4 py-2">24</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">M</td>
              <td className="border px-4 py-2">10</td>
              <td className="border px-4 py-2">34–35</td>
              <td className="border px-4 py-2">28–29</td>
              <td className="border px-4 py-2">38–39</td>
              <td className="border px-4 py-2">29</td>
              <td className="border px-4 py-2">24</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">L</td>
              <td className="border px-4 py-2">12</td>
              <td className="border px-4 py-2">35–36</td>
              <td className="border px-4 py-2">30–30</td>
              <td className="border px-4 py-2">39–40</td>
              <td className="border px-4 py-2">29</td>
              <td className="border px-4 py-2">25</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">XL</td>
              <td className="border px-4 py-2">14</td>
              <td className="border px-4 py-2">37–37</td>
              <td className="border px-4 py-2">31–31</td>
              <td className="border px-4 py-2">40–41</td>
              <td className="border px-4 py-2">30</td>
              <td className="border px-4 py-2">25</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">XXL</td>
              <td className="border px-4 py-2">16</td>
              <td className="border px-4 py-2">37–38</td>
              <td className="border px-4 py-2">31–32</td>
              <td className="border px-4 py-2">41–42</td>
              <td className="border px-4 py-2">31</td>
              <td className="border px-4 py-2">26</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SizeChart;
