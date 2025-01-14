// /frontend/src/components/ModelSelector.jsx
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ModelSelector({ onModelChange = () => {} }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/models');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        const formattedModels = data.map(model => ({
          name: model.name,
          description: `${model.size ? `Size: ${(model.size / 1e9).toFixed(1)}GB` : ''}`,
          value: model.name
        }));
        setModels(formattedModels);
        
        // If we have models, set the first one as default
        if (formattedModels.length > 0) {
          setSelectedModel(formattedModels[0].value);
          onModelChange(formattedModels[0].value);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching models:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchModels();
  }, []); // Remove onModelChange from dependencies

  const handleModelChange = (value) => {
    setSelectedModel(value);
    onModelChange(value);
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px] bg-background">
          <SelectValue placeholder="Loading models..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px] bg-background">
          <SelectValue placeholder="Error loading models" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={selectedModel} onValueChange={handleModelChange}>
      <SelectTrigger className="w-[200px] bg-background">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            <div className="flex flex-col">
              <span>{model.name}</span>
              {model.description && (
                <span className="text-xs text-muted-foreground">
                  {model.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}