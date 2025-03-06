import React, { useState, useEffect } from "react";
import { Database, LineChart, Terminal, Brain, AlertCircle, GitBranch, Table2, Key, BarChart3, Layers, Clock } from "lucide-react";

// Define interfaces
interface DataViolationsResponse {
  violations: {
    [tableName: string]: {
      [columnName: string]: string[];
    };
  };
}

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  subModule?: string;
  onSubModuleChange?: (subModule: string) => void;
  triggerDataProfiling: () => void;
}

interface DataProfilingOverviewProps {
  onSubModuleChange: (subModule: string) => void;
  activeModule: string;
  moduleStatuses: { [key: string]: ModuleStatus };
  triggerModule: (moduleName: string) => void;
  triggerAllModules: () => void;
}

type ModuleStatus = 'idle' | 'loading' | 'ready';

// Main Sidebar Component
export function Sidebar({ 
  activeModule, 
  onModuleChange, 
  subModule, 
  onSubModuleChange,
  triggerDataProfiling 
}: SidebarProps) {
  const [violationsCount, setViolationsCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Fetch violations count
  useEffect(() => {
    fetch("http://127.0.0.1:8000/business-rules/violations/summary/")
      .then((res) => res.json())
      .then((data: DataViolationsResponse) => {
        const total = Object.values(data.violations).reduce(
          (acc, table) =>
            acc + Object.values(table).reduce((tableAcc, field) => tableAcc + field.length, 0),
          0
        );
        setViolationsCount(total);
      })
      .catch((err) => console.error("Error fetching violations:", err));
  }, []);

  // Restructured main modules
  const mainModules = [
    { 
      id: "sigmaDQ", 
      name: "SigmaDQ", 
      icon: Database,
      subModules: [
        { 
          id: "dataProfiler", 
          name: "Data Profiling", 
          subItems: [
            "Data Quality",
            "Data Frequency", 
            "Data Granularity",
            "Statistical Analysis"
          ]
        },
        { 
          id: "keyRelationships", 
          name: "Key Relationships", 
          subItems: [
            "Fact Table And Dimension Table",
            "Primary Key Foreign Key Relation"
          ]
        },
        { id: "anomalyDetection", name: "Anomaly Detection", subItems: [] },
        { id: "sqlGenerator", name: "SQL Generator", subItems: [] },
        { id: "nlp", name: "NLP", subItems: [] }
      ]
    }
  ];

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value, 10));
  };

  // Handle module toggle
  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <>
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white h-screen fixed top-0 left-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">SigmaDQ</h1>
        </div>
        
        {/* Slider Component */}
        <div className="p-4 border-b border-gray-700">
          <label htmlFor="data-threshold" className="block text-sm font-medium mb-2">
            Data Threshold: {sliderValue}%
          </label>
          <input
            type="range"
            id="data-threshold"
            name="data-threshold"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <nav className="flex-1">
          <ul className="p-2">
            {mainModules.map((module) => (
              <li key={module.id}>
                {/* Main Module Button */}
                <button
                  onClick={() => {
                    onModuleChange(module.id);
                    toggleModule(module.id);
                  }}
                  className={`w-full flex items-center p-2 rounded-md mb-1 ${
                    activeModule === module.id ? "bg-blue-600" : "hover:bg-gray-700"
                  }`}
                >
                  <module.icon className="w-5 h-5 mr-2" />
                  {module.name}
                </button>

                {/* Expanded Submenu */}
                {expandedModule === module.id && (
                  <div className="ml-4 mt-2 space-y-1">
                    {module.subModules.map((subModule) => (
                      <div key={subModule.id}>
                        <button
                          onClick={() => {
                            onModuleChange(subModule.id);
                            if (subModule.subItems.length > 0) {
                              toggleModule(subModule.id);
                            }
                          }}
                          className={`w-full text-left p-2 rounded-md text-sm flex justify-between ${
                            activeModule === subModule.id ? "bg-gray-700" : "hover:bg-gray-700"
                          }`}
                        >
                          {subModule.name}
                          {subModule.subItems.length > 0 && (
                            <span className="text-xs">▼</span>
                          )}
                        </button>

                        {/* Sub-items */}
                        {subModule.subItems.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1">
                            {subModule.subItems.map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  onModuleChange(subModule.id);
                                  if (onSubModuleChange) {
                                    onSubModuleChange(item);
                                  }
                                }}
                                className={`w-full text-left p-2 rounded-md text-sm ${
                                  subModule === item ? "bg-gray-600" : "hover:bg-gray-700"
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Floating Alert Button for Data Violations */}
      {violationsCount > 0 && (
        <button
          onClick={() => setIsPopupOpen(true)}
          className="fixed bottom-4 right-4 bg-red-500 text-white rounded-full p-4 shadow-lg hover:bg-red-600 transition-all duration-300 animate-bounce"
        >
          <AlertCircle className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-700 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {violationsCount}
          </span>
        </button>
      )}
    </>
  );
}

// Data Profiling Overview Component
export function DataProfilingOverview({ 
  onSubModuleChange, 
  activeModule,
  moduleStatuses,
  triggerModule,
  triggerAllModules
}: DataProfilingOverviewProps) {
  const features = [
    { icon: Database, title: "Data Quality", description: "Analyze data completeness, accuracy, and consistency", color: "from-blue-500 to-blue-600", module: "Data Quality" },
    { icon: GitBranch, title: "Column Correlation", description: "Discover relationships between data columns", color: "from-purple-500 to-purple-600", module: "Column Correlation" },
    { icon: Table2, title: "Fact & Dimension Tables", description: "Identify and analyze table relationships", color: "from-green-500 to-green-600", module: "Fact Table And Dimension Table" },
    { icon: Key, title: "Primary & Foreign Keys", description: "Map key relationships across tables", color: "from-yellow-500 to-yellow-600", module: "Primary Key Foreign Key Relation" },
    { icon: BarChart3, title: "Statistical Analysis", description: "Get detailed statistical insights", color: "from-pink-500 to-pink-600", module: "Statistical Analysis" },
    { icon: AlertCircle, title: "Business Rule Violations", description: "Detect and analyze rule violations", color: "from-red-500 to-red-600", module: "Business Rule Violations" },
    { icon: Layers, title: "Data Granularity", description: "Analyze data at different levels", color: "from-indigo-500 to-indigo-600", module: "Data Granularity" },
    { icon: Clock, title: "Data Frequency", description: "Monitor data update patterns", color: "from-cyan-500 to-cyan-600", module: "Data Frequency" },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Profiling</h1>
          <p className="text-lg text-gray-600">Comprehensive tools for analyzing and understanding your data structure and quality</p>
          
          {/* Add an explicit trigger button */}
          <button 
            onClick={triggerAllModules}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all"
          >
            Run All Data Profiling
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => {
                console.log(`Feature clicked: ${feature.module}, Status: ${moduleStatuses[feature.module]}`);
                
                // Check if module data is not ready or loading, only then trigger it
                if (moduleStatuses[feature.module] === 'idle') {
                  console.log(`Triggering module: ${feature.module} (was idle)`);
                  triggerModule(feature.module);
                } else if (moduleStatuses[feature.module] === 'loading') {
                  console.log(`Module ${feature.module} is already loading`);
                } else if (moduleStatuses[feature.module] === 'ready') {
                  console.log(`Module ${feature.module} is already ready - not triggering again`);
                }
                
                // Always navigate to the submodule
                onSubModuleChange(feature.module);
              }}
              className={`text-left bg-gradient-to-br ${feature.color} p-6 rounded-xl text-white transform transition-all duration-200 hover:scale-105 hover:shadow-lg relative`}
            >
              <feature.icon className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
              
              {/* Loading indicator */}
              {moduleStatuses[feature.module] === 'loading' && (
                <div className="absolute top-2 right-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                </div>
              )}
              
              {/* Ready indicator */}
              {moduleStatuses[feature.module] === 'ready' && (
                <div className="absolute top-2 right-2">
                  <div className="h-4 w-4 rounded-full bg-green-300"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main application component
export function App() {
  const [activeModule, setActiveModule] = useState("dataProfiler");
  const [subModule, setSubModule] = useState<string | undefined>(undefined);
  const [moduleStatuses, setModuleStatuses] = useState<{[key: string]: ModuleStatus}>({});
  
  const features = [
    "Data Quality",
    "Data Frequency",
    "Column Correlation",
    "Fact Table And Dimension Table", 
    "Primary Key Foreign Key Relation",
    "Statistical Analysis",
    "Data Granularity",
    "Business Rule Violations"
  ];

  // Initialize module statuses
  useEffect(() => {
    const initialStatuses: {[key: string]: ModuleStatus} = {};
    features.forEach(feature => {
      initialStatuses[feature] = 'idle';
    });
    setModuleStatuses(initialStatuses);
  }, []);

  // Function to handle module status change
  const triggerModule = (moduleName: string) => {
    console.log(`Triggering module: ${moduleName}`);
    
    // Skip if already loading or ready
    if (moduleStatuses[moduleName] === 'loading' || moduleStatuses[moduleName] === 'ready') {
      console.log(`Module ${moduleName} already ${moduleStatuses[moduleName]} - skipping trigger`);
      return;
    }
    
    // Set module to loading state
    setModuleStatuses(prev => ({...prev, [moduleName]: 'loading'}));
    
    // Simulate data processing
    const processingTime = 2000 + Math.random() * 3000; // 2-5 seconds
    setTimeout(() => {
      setModuleStatuses(prev => ({...prev, [moduleName]: 'ready'}));
      console.log(`Module ${moduleName} is now ready`);
    }, processingTime);
  };

  // Function to trigger all submodules - FIXED to always run when called
  const triggerDataProfiling = () => {
    console.log("=== TRIGGERING ALL DATA PROFILING SUBMODULES ===");
    
    // Trigger all submodules in background
    features.forEach(feature => {
      // Only trigger if not already loading or ready
      if (moduleStatuses[feature] === 'idle') {
        console.log(`Queuing module for processing: ${feature}`);
        triggerModule(feature);
      } else {
        console.log(`Module ${feature} already ${moduleStatuses[feature]} - skipping trigger`);
      }
    });
    
    // Navigate to overview if not already there
    if (!subModule) {
      setSubModule("Data Analysis Dashboard");
    }
  };

  // Handle module change
  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    
    // Reset submodule selection
    // Reset submodule selection when changing main modules
    if (module !== "dataProfiler") {
      setSubModule(undefined);
    } else {
      // Set to dashboard without auto-triggering
      setSubModule("Data Analysis Dashboard");
    }
  };
  
  // Handle submodule change
  const handleSubModuleChange = (newSubModule: string) => {
    setSubModule(newSubModule);
    
    // Ensure module is triggered if not already
    if (moduleStatuses[newSubModule] === 'idle') {
      triggerModule(newSubModule);
    } else {
      console.log(`Module ${newSubModule} is already ${moduleStatuses[newSubModule]} - not triggering`);
    }
  };
  
  // Render the appropriate content based on active module and submodule
  const renderContent = () => {
    if (activeModule === "dataProfiler") {
      if (!subModule || subModule === "Data Analysis Dashboard") {
        return (
          <DataProfilingOverview 
            onSubModuleChange={handleSubModuleChange}
            activeModule={activeModule}
            moduleStatuses={moduleStatuses}
            triggerModule={triggerModule}
            triggerAllModules={triggerDataProfiling}  // Pass the trigger function
          />
        );
      } else {
        // Render the appropriate submodule content
        return (
          <div className="p-8 ml-64">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">{subModule}</h2>
              
              {moduleStatuses[subModule] === 'loading' && (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-lg text-gray-600">Loading {subModule} data...</p>
                </div>
              )}
              
              {moduleStatuses[subModule] === 'ready' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p>Data for {subModule} is ready and would be displayed here.</p>
                  {/* Here you would render the actual content for each submodule */}
                </div>
              )}
            </div>
          </div>
        );
      }
    } else {
      // Render content for other main modules
      return (
        <div className="p-8 ml-64">
          <h2 className="text-2xl font-bold mb-4">{activeModule}</h2>
          <p>This is the {activeModule} module content.</p>
        </div>
      );
    }
  };
  
  return (
    <div>
      <Sidebar 
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        subModule={subModule}
        onSubModuleChange={handleSubModuleChange}
        triggerDataProfiling={triggerDataProfiling}  // Make sure this is a function
      />
      <div className="ml-64">
        {renderContent()}
      </div>
    </div>
  );
}

// Export for use in other components or main application
export default App;