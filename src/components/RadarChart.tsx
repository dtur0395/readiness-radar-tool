
import React, { useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart as RechartsRadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend,
  Tooltip
} from 'recharts';
import { Dimension } from '../types/assessmentTypes';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type RadarChartProps = {
  dimensions: Dimension[];
};

type RadarDataPoint = {
  dimension: string;
  current: number;
  target: number;
  fullMark: number;
};

const RadarChart: React.FC<RadarChartProps> = ({ dimensions }) => {
  const prepareData = (): RadarDataPoint[] => {
    return dimensions.map(dim => ({
      dimension: dim.name,
      current: dim.currentRating,
      target: dim.targetRating,
      fullMark: 3
    }));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl">Program-Level Assessment Self-Assessment Radar Chart</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart data={prepareData()} margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ fill: '#333', fontSize: 11 }}
                tickLine={false}
                style={{ fontSize: '10px' }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 3]} tickCount={4} />
              <Radar
                name="Current State"
                dataKey="current"
                stroke="#4682B4"
                fill="#4682B4"
                fillOpacity={0.3}
              />
              <Radar
                name="Target State"
                dataKey="target"
                stroke="#B22222"
                fill="#B22222"
                fillOpacity={0.3}
              />
              <Tooltip />
              <Legend />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-sm mt-4">
          <div className="flex items-center justify-center mb-1">
            <div className="w-3 h-3 mr-1 bg-assessment-current rounded-full"></div>
            <span className="mr-3">Current self-assessment profile</span>
            <div className="w-3 h-3 mr-1 bg-assessment-target rounded-full"></div>
            <span>Program-level Assessment goals</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RadarChart;
