
import React from 'react';
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
import { Dimension, ThematicCluster } from '../types/assessmentTypes';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type RadarChartProps = {
  dimensions: Dimension[];
};

type RadarDataPoint = {
  dimension: string;
  current: number;
  target: number;
  fullMark: number;
  cluster: ThematicCluster;
};

// Define colors for each thematic cluster
const clusterColors: Record<ThematicCluster, {fill: string, stroke: string}> = {
  "Accountability and Coordination": {fill: "#4682B4", stroke: "#2a4d6e"},
  "Learning Outcomes and Curriculum Mapping": {fill: "#3CB371", stroke: "#2a6e4c"},
  "Assessment Quality and Security": {fill: "#9370DB", stroke: "#5f3d9c"},
  "Visibility of Student Achievement": {fill: "#F08080", stroke: "#c25555"}
};

const RadarChart: React.FC<RadarChartProps> = ({ dimensions }) => {
  const prepareData = (): RadarDataPoint[] => {
    return dimensions.map(dim => ({
      dimension: dim.name,
      current: dim.currentRating,
      target: dim.targetRating,
      fullMark: 3,
      cluster: dim.cluster
    }));
  };

  // Group dimensions by cluster for the table
  const dimensionsByCluster = dimensions.reduce<Record<ThematicCluster, Dimension[]>>((acc, dimension) => {
    if (!acc[dimension.cluster]) {
      acc[dimension.cluster] = [];
    }
    acc[dimension.cluster].push(dimension);
    return acc;
  }, {} as Record<ThematicCluster, Dimension[]>);

  const clusters = Object.keys(dimensionsByCluster) as ThematicCluster[];

  // Custom radar component to color by cluster
  const CustomizedRadar = ({ dataKey }: { dataKey: string }) => {
    return clusters.map((cluster) => {
      // Filter data points by this cluster
      const clusterDimensions = dimensions.filter(d => d.cluster === cluster);
      const clusterDimensionNames = clusterDimensions.map(d => d.name);
      
      // Color based on the cluster
      const { fill, stroke } = clusterColors[cluster];
      
      return (
        <Radar
          key={`${dataKey}-${cluster}`}
          name={`${dataKey === 'current' ? 'Current State' : 'Target State'} - ${cluster}`}
          dataKey={dataKey}
          stroke={dataKey === 'current' ? stroke : "#B22222"}
          fill={dataKey === 'current' ? fill : "#B22222"}
          fillOpacity={0.3}
          dot={true}
          activeDot={{ r: 5 }}
          // This is the key part: only include data points for this cluster
          isAnimationActive={false}
          // Use payload filter to only show relevant dimensions
          legendType="rect"
        />
      );
    });
  };
  
  const [isTableOpen, setIsTableOpen] = React.useState(false);

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
                tick={{ 
                  fill: '#333', 
                  fontSize: 11,
                  // This function customizes each dimension label with its cluster color
                  formatter: (value, index) => {
                    const dim = dimensions.find(d => d.name === value);
                    if (!dim) return value;
                    return value;
                  }
                }}
                tickLine={false}
                style={{ fontSize: '10px' }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 3]} tickCount={4} />
              
              {/* Use custom radar components based on clusters */}
              <CustomizedRadar dataKey="current" />
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
        
        {/* Cluster legend */}
        <div className="text-center text-sm mt-4 mb-4">
          <h3 className="font-medium mb-2">Thematic Clusters:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {clusters.map((cluster) => (
              <div key={cluster} className="flex items-center">
                <div 
                  className="w-4 h-4 mr-1 rounded-sm" 
                  style={{ backgroundColor: clusterColors[cluster].fill }}
                ></div>
                <span>{cluster}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center text-sm mt-2">
          <div className="flex items-center justify-center mb-1">
            <div className="w-3 h-3 mr-1 bg-assessment-current rounded-full"></div>
            <span className="mr-3">Current self-assessment profile</span>
            <div className="w-3 h-3 mr-1 bg-assessment-target rounded-full"></div>
            <span>Program-level Assessment goals</span>
          </div>
        </div>
        
        {/* Collapsible table showing dimensions by cluster */}
        <Collapsible open={isTableOpen} onOpenChange={setIsTableOpen} className="mt-6">
          <CollapsibleTrigger className="flex items-center justify-center w-full py-2 border rounded-md hover:bg-gray-100">
            {isTableOpen ? "Hide Dimension Details" : "Show Dimension Details"}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimension</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Thematic Cluster</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dimensions.map((dim) => (
                    <TableRow key={dim.id}>
                      <TableCell className="font-medium">{dim.name}</TableCell>
                      <TableCell>{dim.stage}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 mr-2 rounded-sm"
                            style={{ backgroundColor: clusterColors[dim.cluster].fill }}
                          ></div>
                          {dim.cluster}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default RadarChart;
