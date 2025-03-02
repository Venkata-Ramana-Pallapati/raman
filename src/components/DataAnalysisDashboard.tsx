import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { Payload } from 'recharts/types/component/DefaultTooltipContent';

// --- Types ---

interface FileUploadSectionProps {
  file: File | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface DateRangeSectionProps {
  startDate: string;
  endDate: string;
  handleStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ModelOption {
  value: string;
  label: string;
  description: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  handleModelChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  modelOptions: ModelOption[];
}

interface CategoryStatsProps {
  category: string;
  categoryData: any[];
  colorMap: { [key: string]: string };
}

interface InsightCardProps {
  category: string;
  categoryData: any[];
  colorMap: { [key: string]: string };
}

// Updated interface for multi-select
interface GroupSelectorProps {
  groupColumn: string;
  groupValues: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

interface DataItem {
  [key: string]: any;
  ds: string;
  value: number | undefined;
  yhat?: number | string;
  yhat_lower?: number | string;
  yhat_upper?: number | string;
  Category?: string;
  ProductName?: string;
}

interface FetchButtonProps {
  fetchPredictions: () => Promise<void>;
  loading: boolean;
  file: File | null;
}

interface ResultItem {
  ds: string;
  yhat: number;
  yhat_lower?: number;
  yhat_upper?: number;
  Category: string;
  ProductName: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload<number, string>[];
  label?: string;
}

// Updated to store arrays of values
interface GroupSelections {
  [key: string]: string[];
}

// --- Sub-components ---
const FileUploadSection: React.FC<FileUploadSectionProps> = ({ file, handleFileChange }) => (
  <div className="md:col-span-4 text-center">
    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Product Data</label>
    <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span className="text-sm text-gray-500 mb-2">CSV file with time series data</span>
      <input 
        type="file" 
        onChange={handleFileChange} 
        className="hidden" 
        id="file-upload" 
        accept=".csv"
      />
      <label htmlFor="file-upload" className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium cursor-pointer">
        Select File
      </label>
      {file && <p className="mt-2 text-xs text-gray-500">{file.name}</p>}
    </div>
  </div>
);

const DateRangeSection: React.FC<DateRangeSectionProps> = ({
  startDate,
  endDate,
  handleStartDateChange,
  handleEndDateChange,
}) => (
  <div className="md:col-span-4 grid grid-cols-2 gap-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={handleStartDateChange}
        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={handleEndDateChange}
        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>
  </div>
);

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  handleModelChange,
  modelOptions,
}) => (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Model</label>
    <select
      value={selectedModel}
      onChange={handleModelChange}
      className="w-full border border-gray-300 rounded-md p-2 text-sm appearance-none bg-gradient-to-r from-green-50 to-blue-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "8px 10px" }}
    >
      {modelOptions.map(model => (
        <option key={model.value} value={model.value}>
          {model.label}
        </option>
      ))}
    </select>
  </div>
);

// Updated multi-select group selector
const GroupSelector: React.FC<GroupSelectorProps> = ({
  groupColumn,
  groupValues,
  selectedValues,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  
  const handleValueToggle = (value: string) => {
    let newValues;
    if (selectedValues.includes(value)) {
      newValues = selectedValues.filter(v => v !== value);
    } else {
      newValues = [...selectedValues, value];
    }
    onChange(newValues);
  };
  
  const removeValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== value));
  };

  return (
    <div className="w-full relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{groupColumn}</label>
      <div 
        className="w-full border border-gray-300 rounded-md p-2 min-h-10 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer flex flex-wrap items-center"
        onClick={toggleOpen}
      >
        {selectedValues.length === 0 ? (
          <span className="text-gray-500">Select {groupColumn}...</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map(value => (
              <span 
                key={value} 
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md flex items-center"
              >
                {value}
                <button 
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={(e) => removeValue(value, e)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-1 border-b border-gray-200">
            <div 
              className="cursor-pointer py-1 px-2 hover:bg-blue-50 text-sm rounded"
              onClick={() => { onChange([]); setIsOpen(false); }}
            >
              Clear all
            </div>
          </div>
          {groupValues.map(value => (
            <div 
              key={value} 
              className="cursor-pointer py-1 px-2 hover:bg-blue-50 text-sm"
              onClick={() => handleValueToggle(value)}
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedValues.includes(value)}
                onChange={() => {}}
                onClick={(e) => e.stopPropagation()}
              />
              {value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FetchButton: React.FC<FetchButtonProps> = ({ fetchPredictions, loading, file }) => (
  <div className="md:col-span-2">
    <button 
      onClick={fetchPredictions} 
      disabled={loading || !file}
      className="w-full py-2 rounded-md font-medium text-white text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      style={{ 
        background: !loading ? "linear-gradient(to right, #4CAF50, #2196F3)" : "#ccc",
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </div>
      ) : (
        <span>Generate Forecast</span>
      )}
    </button>
  </div>
);

const CategoryStats: React.FC<CategoryStatsProps> = ({
  category,
  categoryData,
  colorMap,
}) => {
  if (categoryData.length === 0) return null;
  
  const firstValue = categoryData[0]?.yhat || 0;
  const lastValue = categoryData[categoryData.length - 1]?.yhat || 0;
  const growthPercent = firstValue > 0 
    ? ((lastValue - firstValue) / firstValue * 100).toFixed(1)
    : "N/A";
  
  const isPositive = parseFloat(growthPercent) > 0;
  const growthColor = isPositive ? '#4CAF50' : '#F44336';
  
  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-md"
      style={{ borderLeft: `4px solid ${colorMap[category]}` }}
    >
      <h4 className="font-medium text-sm mb-2">{category}</h4>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">Growth:</span>
        <span className="font-bold text-sm" style={{ color: growthColor }}>
          {growthPercent !== "N/A" ? `${growthPercent}%` : "N/A"}
          {isPositive && growthPercent !== "N/A" ? ' ↑' : growthPercent !== "N/A" ? ' ↓' : ''}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="h-2 rounded-full" 
          style={{ 
            width: `${Math.min(100, Math.max(0, parseFloat(growthPercent) + 100) / 2)}%`,
            backgroundColor: colorMap[category]
          }}>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Initial:</span>
          <div className="font-medium">{firstValue.toFixed(1)}</div>
        </div>
        <div>
          <span className="text-gray-500">Final:</span>
          <div className="font-medium">{lastValue.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};

const InsightCard: React.FC<InsightCardProps> = ({ category, categoryData, colorMap }) => {
  if (categoryData.length === 0) return null;
  
  // Calculate trends
  const values = categoryData.map(d => d.yhat);
  const lastThreeValues = values.slice(-3);
  const isRising = lastThreeValues[2] > lastThreeValues[0];
  const isSteady = Math.abs(lastThreeValues[2] - lastThreeValues[0]) < 0.05 * lastThreeValues[0];
  
  // Generate insights based on pattern
  let recommendation = '';
  let insight = '';
  
  if (isRising) {
    insight = `${category} shows positive growth trend.`;
    recommendation = "Consider increasing inventory and marketing investment.";
  } else if (isSteady) {
    insight = `${category} is showing stable performance.`;
    recommendation = "Maintain current strategy while monitoring for changes.";
  } else {
    insight = `${category} has a declining trend.`;
    recommendation = "Analyze causes and consider promotional activities.";
  }
  
  return (
    <div 
      className="p-3 rounded-lg border"
      style={{ borderLeft: `4px solid ${colorMap[category]}` }}
    >
      <h4 className="font-medium text-sm mb-1">{category}</h4>
      <p className="text-sm text-gray-600 mb-2">{insight}</p>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-blue-600">{recommendation}</span>
      </div>
    </div>
  );
};

// --- Main Component ---
const TimeseriesPredictionChart: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupingColumns, setGroupingColumns] = useState<string[]>([]);
  const [metricColumns, setMetricColumns] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("Prophet");
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  // Updated to use arrays for selections
  const [groupSelections, setGroupSelections] = useState<GroupSelections>({});
  const [uniqueGroupValues, setUniqueGroupValues] = useState<{[key: string]: string[]}>({});
  // Toggle for tabular view
  const [showTable, setShowTable] = useState<boolean>(true);
  
  // Model options with their display information
  const modelOptions = [
    { value: "Prophet", label: "Prophet", description: "Facebook's time series forecasting model" },
    { value: "ETS", label: "ETS", description: "Predicts future values by learning trends, seasonality, and noise." },
    { value: "ARIMA", label: "ARIMA", description: "Statistical method for time series forecasting" },
    { value: "SARIMA", label: "SARIMA", description: "Statistical method for time series forecasting" }
  ];

  // Set default dates on first load
  useEffect(() => {
    const currentDate = new Date();
    
    // Set end date to 30 days from now
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30);
    
    // Set start date to today
    setStartDate(currentDate.toISOString().split('T')[0]);
    setEndDate(futureDate.toISOString().split('T')[0]);
  }, []);

  // Enhanced color palette for better visualization
  const generateColorMap = (categories: string[]) => {
    const predefinedColors = [
      "#1E88E5", "#D81B60", "#8E24AA", "#43A047", 
      "#FB8C00", "#E53935", "#5E35B1", "#3949AB",
      "#039BE5", "#00ACC1", "#00897B", "#7CB342",
      "#FFD600", "#6D4C41", "#546E7A", "#F06292"
    ];
    
    const colorMap: { [key: string]: string } = {};

    categories.forEach((category, index) => {
      colorMap[category] = predefinedColors[index % predefinedColors.length];
    });
    
    return colorMap;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleMetricChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMetric(event.target.value);
  };
  
  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(event.target.value);
  };

  // Updated to handle arrays of values
  const handleGroupSelectionChange = (groupColumn: string, values: string[]) => {
    setGroupSelections(prev => ({
      ...prev,
      [groupColumn]: values
    }));
  };

  const fetchPredictions = async () => {
    if (!file || !startDate || !endDate) return;
  
    setLoading(true);
    setLastFetch(new Date());
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("model_name", selectedModel);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/predict/", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!result.error) {
        analyzeDataStructure(result.predictions);
        const processedData = preprocessData(result.predictions); // Pass only predictions array
        setData(processedData);
        
        // Set default selected metric
        const metrics = getUniqueMetrics(processedData);
        console.log(metrics);
        if (metrics.length > 0 && typeof metrics[0] === 'string') {
          setSelectedMetric(metrics[0]);
        }
        
        // Extract unique values for each group column
        extractUniqueGroupValues(processedData);
      } else {
        console.error("Error:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
      alert("Failed to fetch predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for each group column
  const extractUniqueGroupValues = (processedData: DataItem[]) => {
    const groupValues: {[key: string]: Set<string>} = {};
    
    console.log(groupValues)
    // Initialize group selections with empty arrays
    const initialSelections: GroupSelections = {};
    
    groupingColumns.forEach(col => {
      groupValues[col] = new Set<string>();
      initialSelections[col] = [];
    });
    
    // Handle nested Group object structure
    if (processedData.length > 0 && processedData[0].Group && typeof processedData[0].Group === 'object') {
      processedData.forEach(item => {
        if (item.Group) {
          groupingColumns.forEach(col => {
            if (item.Group[col] && typeof item.Group[col] === 'string') {
              groupValues[col].add(item.Group[col]);
            }
          });
        }
      });
    } 
    // Original logic for non-nested groups
    else {
      processedData.forEach(item => {
        groupingColumns.forEach(col => {
          if (item[col] && typeof item[col] === 'string') {
            groupValues[col].add(item[col]);
          } else if (Array.isArray(item[col])) {
            item[col].forEach((value: string) => {
              if (value) groupValues[col].add(value);
            });
          }
        });
      });
    }
    
    // Convert Sets to arrays and sort
    const uniqueValues: {[key: string]: string[]} = {};
    Object.keys(groupValues).forEach(col => {
      uniqueValues[col] = Array.from(groupValues[col]).sort();
    });
    
    setUniqueGroupValues(uniqueValues);
    setGroupSelections(initialSelections);
  };

  // Preprocess data to ensure consistent structure
  const preprocessData = (rawData: any) => {
    if (!rawData || rawData.length === 0) return [];
    
    return rawData.map((item: any) => {
      // Standardize date format
      const dateObj = new Date(item.ds);
      const formattedDate = dateObj.toISOString().split('T')[0];
      
      // Ensure all number values are properly converted
      const processedItem = { ...item, ds: formattedDate };
      
      // Convert prediction values to numbers
      if (typeof item.yhat === 'string') {
        processedItem.yhat = parseFloat(item.yhat);
      }
      
      // Handle upper and lower bounds if present
      if (item.yhat_lower) {
        processedItem.yhat_lower = typeof item.yhat_lower === 'string' 
          ? parseFloat(item.yhat_lower) 
          : item.yhat_lower;
      }
      
      if (item.yhat_upper) {
        processedItem.yhat_upper = typeof item.yhat_upper === 'string' 
          ? parseFloat(item.yhat_upper) 
          : item.yhat_upper;
      }
      
      return processedItem;
    });
  };
  
  // Data structure analysis
  const analyzeDataStructure = (data: any) => {
    if (!data || data.length === 0) return;
    
    const firstItem = data[0];
    const columns = Object.keys(firstItem);
    
    // Find grouping columns - now checking for Group object
    let potentialGroupingColumns = [];
    
    // Check if we have a Group object structure
    if (firstItem.Group && typeof firstItem.Group === 'object') {
      potentialGroupingColumns = Object.keys(firstItem.Group);
    } else {
      potentialGroupingColumns = columns.filter(col => {
        const sample = firstItem[col];
        
        if (typeof sample === 'string') {
          const isNotNumeric = !/^\d+(\.\d+)?$/.test(sample);
          const isNotDate = !/^\d{4}-\d{2}-\d{2}/.test(sample) && col !== 'ds';
          const isExplicitGroup = /^(group|category|segment|product|line|division)/i.test(col);
          
          return (Array.isArray(sample) || (isNotNumeric && isNotDate) || isExplicitGroup);
        }
        
        return false;
      });
    }
    
    // Find metric columns
    const potentialMetricColumns = columns.includes('Metric') ? ['Metric'] : 
      columns.filter(col => {
        return /^(metric|measure|indicator|type|kpi)/i.test(col);
      });

    setGroupingColumns(potentialGroupingColumns);
    setMetricColumns(potentialMetricColumns.length > 0 ? potentialMetricColumns : ['default']);
  };

  // Get unique metrics from the data
  const getUniqueMetrics = (dataSet = data) => {
    if (dataSet.length === 0) return [];
    
    // If we have Metric field directly
    if (dataSet[0].hasOwnProperty('Metric')) {
      return Array.from(new Set(dataSet.map(item => item.Metric)));
    }
    
    // If we have explicit metric columns
    if (metricColumns.length > 0 && metricColumns[0] !== 'default') {
      const metricCol = metricColumns[0];
      return Array.from(new Set(dataSet.map(item => item[metricCol])));
    }
    
    // If no explicit metrics, return product-focused names
    return ['Product Growth Forecast'];
  };

  // Get unique categories from grouping columns
  const getCategories = (metricName: any, dataSet = data) => {
    if (dataSet.length === 0) return [];
    
    // Filter data by metric if applicable
    const filteredData = metricColumns[0] !== 'default' && metricColumns[0] === 'Metric'
      ? dataSet.filter(item => item.Metric === metricName)
      : dataSet;

    // Apply group selections filtering
    const dataAfterGroupFilters = applyGroupFilters(filteredData);
    
    // Handle nested Group object structure
    if (dataAfterGroupFilters.length > 0 && dataAfterGroupFilters[0].Group && typeof dataAfterGroupFilters[0].Group === 'object') {
      // For nested group structure, use the remaining unselected group for categories
      // or the first group if all are selected
      const unselectedGroups = groupingColumns.filter(col => !groupSelections[col] || groupSelections[col].length === 0);
      const categoryCol = unselectedGroups.length > 0 ? unselectedGroups[0] : groupingColumns[0];
      
      if (!categoryCol) return ['Overall'];
      
      const uniqueCategories = new Set<string>();
      
      dataAfterGroupFilters.forEach(item => {
        if (item.Group && item.Group[categoryCol]) {
          uniqueCategories.add(item.Group[categoryCol]);
        }
      });
      
      return Array.from(uniqueCategories).sort();
    }
    // Original logic for non-nested groups  
    else if (groupingColumns.length > 0) {
      // Find a group column that hasn't been selected in the dropdowns
      const unselectedGroups = groupingColumns.filter(col => !groupSelections[col] || groupSelections[col].length === 0);
      const groupCol = unselectedGroups.length > 0 ? unselectedGroups[0] : groupingColumns[0];
      
      if (!groupCol) return ['Overall'];
      
      // Handle array-type grouping
      if (dataAfterGroupFilters.length > 0 && Array.isArray(dataAfterGroupFilters[0][groupCol])) {
        const uniqueCategories = new Set<string>();
        
        dataAfterGroupFilters.forEach(item => {
          const groupArray = item[groupCol];
          if (Array.isArray(groupArray)) {
            groupArray.forEach(value => {
              if (value) uniqueCategories.add(value.toString());
            });
          }
        });
        
        return Array.from(uniqueCategories);
      } 
      // Handle string-type grouping
      else {
        const categories = Array.from(
          new Set(
            dataAfterGroupFilters.map(item => item[groupCol])
          )
        );
        return categories.filter(c => c).sort();
      }
    }
    
    // Default product-focused category
    return ['Product Trend'];
  };
  // Apply the group selections filter to the data
  const applyGroupFilters = (dataToFilter: DataItem[]) => {
    if (Object.keys(groupSelections).length === 0) return dataToFilter;
    
    return dataToFilter.filter(item => {
      // Check all group selections
      return Object.entries(groupSelections).every(([column, selectedValues]) => {
        // If no values selected for this column, don't filter on it
        if (selectedValues.length === 0) return true;
        
        // Handle nested Group object structure
        if (item.Group && typeof item.Group === 'object') {
          return selectedValues.includes(item.Group[column]);
        }
        
        // Handle array values
        if (Array.isArray(item[column])) {
          return item[column].some(value => selectedValues.includes(value));
        }
        
        // Handle simple string values
        return selectedValues.includes(item[column]);
      });
    });
  };

  // Filter data based on selections
  const getFilteredData = (metricName: string) => {
    if (data.length === 0) return [];
  
    // First filter by metric if applicable
    let filtered = metricColumns[0] !== 'default'
      ? data.filter(item => item.Metric === metricName)
      : data;
  
    // Apply group filters
    filtered = applyGroupFilters(filtered);
  
    // If multiple group columns are selected, aggregate data by date
    const selectedGroupColumns = Object.keys(groupSelections).filter(
      col => groupSelections[col] && groupSelections[col].length > 0
    );
  
    if (selectedGroupColumns.length > 1) {
      const aggregatedData: { [key: string]: DataItem } = {};
  
      filtered.forEach(item => {
  const date = item.ds;

  if (!aggregatedData[date]) {
    aggregatedData[date] = { ...item, yhat: 0 }; // Initialize yhat as number
  }

  // Explicitly cast both sides to number to avoid type errors
  aggregatedData[date].yhat = Number(aggregatedData[date].yhat) + (typeof item.yhat === 'number' ? item.yhat : 0);
});

      // Convert the aggregated data back to an array
      return Object.values(aggregatedData).sort((a, b) =>
        new Date(a.ds).getTime() - new Date(b.ds).getTime()
      );
    }
  
    return filtered;
  };

  // Group data by category for chart display
  const getCategoryData = (category: string, metricName: string) => {
    const filtered = getFilteredData(metricName);
    if (filtered.length === 0) return [];
  
    // For nested Group object structure
    if (filtered[0].Group && typeof filtered[0].Group === 'object') {
      // Find which group column is being used for categories
      const unselectedGroups = groupingColumns.filter(col =>
        !groupSelections[col] || groupSelections[col].length === 0
      );
      const categoryCol = unselectedGroups.length > 0 ? unselectedGroups[0] : groupingColumns[0];
  
      return filtered.filter(item => item.Group[categoryCol] === category);
    }
  
    // For regular structure, find which column has the category
    for (const col of groupingColumns) {
      const hasCategory = filtered.some(item => {
        if (Array.isArray(item[col])) {
          return item[col].includes(category);
        }
        return item[col] === category;
      });
  
      if (hasCategory) {
        return filtered.filter(item => {
          if (Array.isArray(item[col])) {
            return item[col].includes(category);
          }
          return item[col] === category;
        });
      }
    }
  
    // Default case if no matching column found
    return filtered;
  };
  // Custom tooltip for the chart
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}: </span>
            <span>{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}</span>
          </p>
        ))}
      </div>
    );
  };

  // For datatable display
  const getTableData = (metricName: string) => {
    const filtered = getFilteredData(metricName);
    if (filtered.length === 0) return [];
    
    // Group by date for tabular display
    const groupedByDate: {[key: string]: any} = {};
    
    filtered.forEach(item => {
      const date = item.ds;
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date };
      }
      
      // Determine category from grouping columns
      let category = 'Unknown';
      
      // Handle nested Group object
      if (item.Group && typeof item.Group === 'object') {
        const unselectedGroups = groupingColumns.filter(col => 
          !groupSelections[col] || groupSelections[col].length === 0
        );
        const categoryCol = unselectedGroups.length > 0 ? unselectedGroups[0] : groupingColumns[0];
        category = item.Group[categoryCol];
      } else {
        // Try to find which column has category info
        for (const col of groupingColumns) {
          if (item[col]) {
            category = Array.isArray(item[col]) ? item[col][0] : item[col];
            break;
          }
        }
      }
      
      // Add forecast value under the category name
      groupedByDate[date][category] = item.yhat;
    });
    
    // Convert to array
    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Download data as CSV
  const downloadCSV = () => {
    if (data.length === 0) return;
    
    const tableData = getTableData(selectedMetric);
    if (tableData.length === 0) return;
    
    // Get all columns from the first row
    const columns = Object.keys(tableData[0]);
    
    // Create CSV header
    let csvContent = columns.join(',') + '\n';
    
    // Add data rows
    tableData.forEach(row => {
      const rowData = columns.map(col => {
        const value = row[col];
        // Handle strings with commas by wrapping in quotes
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
      csvContent += rowData + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `forecast_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle between chart and table view
  const toggleView = () => {
    setShowTable(!showTable);
  };

  // Check if we have valid data to display
  const hasData = data.length > 0;
  
  // Get categories and color map
  const categories = hasData ? getCategories(selectedMetric) : [];
  const colorMap = generateColorMap(categories);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Time Series Forecast & Analysis
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload your product data, select parameters, and generate AI-powered forecasts
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <FileUploadSection file={file} handleFileChange={handleFileChange} />
            <DateRangeSection
              startDate={startDate}
              endDate={endDate}
              handleStartDateChange={handleStartDateChange}
              handleEndDateChange={handleEndDateChange}
            />
            <ModelSelector
              selectedModel={selectedModel}
              handleModelChange={handleModelChange}
              modelOptions={modelOptions}
            />
            <FetchButton
              fetchPredictions={fetchPredictions}
              loading={loading}
              file={file}
            />
          </div>
        </div>

        {hasData && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                
                {/* Metric selector */}
                {metricColumns[0] !== 'default' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                    <select
                      value={selectedMetric}
                      onChange={handleMetricChange}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    >
                      {getUniqueMetrics().map(metric => (
                        <option key={metric} value={metric}>
                          {metric}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Group selectors */}
                {groupingColumns.map(column => (
                  <div key={column} className="mb-4">
                    <GroupSelector
                      groupColumn={column}
                      groupValues={uniqueGroupValues[column] || []}
                      selectedValues={groupSelections[column] || []}
                      onChange={(values) => handleGroupSelectionChange(column, values)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Category stats */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Stats</h3>
                  <span className="text-xs text-gray-500">
                    {lastFetch ? `Updated: ${lastFetch.toLocaleTimeString()}` : ''}
                  </span>
                </div>
                <div className="space-y-3">
                  {categories.map(category => (
                    <CategoryStats
                      key={category}
                      category={category}
                      categoryData={getCategoryData(category, selectedMetric)}
                      colorMap={colorMap}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedMetric !== "" ? selectedMetric : "Forecast"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleView}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium"
                    >
                      {showTable ? "Show Chart" : "Show Table"}
                    </button>
                    <button
                      onClick={downloadCSV}
                      className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-md text-sm font-medium"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                {showTable ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          {categories.map(category => (
                            <th 
                              key={category}
                              className="py-2 px-3 border-b text-left text-xs font-medium uppercase tracking-wider"
                              style={{ color: colorMap[category] }}
                            >
                              {category}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                      {getTableData(selectedMetric).map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-2 px-3 border-b text-sm">
                                  {new Date(row.date).toLocaleDateString()}
                                </td>
                                {categories.map(category => (
                                  <td key={category} className="py-2 px-3 border-b text-sm">
                                    {row[category] !== undefined ? row[category].toFixed(2) : "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getFilteredData(selectedMetric)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                           dataKey="ds" 
                      type="category" 
                      allowDuplicatedCategory={false}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // Format: YYYY-MM-DD
                      }}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {categories.map(category => (
                          <Line
                            key={category}
                            type="monotone"
                            data={getCategoryData(category, selectedMetric)}
                            dataKey="yhat"
                            name={category}
                            stroke={colorMap[category]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              {/* Insights section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <InsightCard
                    key={category}
                    category={category}
                    categoryData={getCategoryData(category, selectedMetric)}
                    colorMap={colorMap}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no data is loaded */}
        {!hasData && !loading && (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data loaded</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload a CSV file with time series data to get started.
            </p>
            <div className="mt-6">
              <label
                htmlFor="file-upload-empty"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload CSV
              </label>
              <input
                id="file-upload-empty"
                name="file-upload-empty"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeseriesPredictionChart;