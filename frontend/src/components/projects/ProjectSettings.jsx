// /frontend/src/components/projects/ProjectSettings.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, Settings } from "lucide-react";

export function ProjectSettings({ open, onOpenChange, project, onSave }) {
  const [settings, setSettings] = React.useState({
    style: {
      tone: 'formal',
      languageLevel: 'intermediate',
      codeStyle: 'documented'
    },
    context: {
      includeProjectDescription: true,
      maxPreviousMessages: 5,
      includeInsights: true
    },
    knowledgeBase: {
      terminology: [],
      references: [],
      codeExamples: []
    },
    requirements: {
      mandatoryElements: [],
      restrictions: [],
      technologies: []
    },
    outputPreferences: {
      format: 'markdown',
      includeExamples: true,
      codeBlockStyle: 'documented'
    }
  });

  React.useEffect(() => {
    if (project?.config) {
      setSettings(project.config);
    }
  }, [project]);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${project._id}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const updatedProject = await response.json();
        onSave?.(updatedProject);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving project settings:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Settings: {project?.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Conversation Tone</Label>
                <Select 
                  value={settings.style.tone}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      style: { ...prev.style, tone: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Technical Level</Label>
                <Select 
                  value={settings.style.languageLevel}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      style: { ...prev.style, languageLevel: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Code Style</Label>
                <Select 
                  value={settings.style.codeStyle}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      style: { ...prev.style, codeStyle: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select code style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="documented">Documented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Context Tab */}
          <TabsContent value="context" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDescription"
                  checked={settings.context.includeProjectDescription}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      context: {
                        ...prev.context,
                        includeProjectDescription: checked
                      }
                    }))
                  }
                />
                <Label htmlFor="includeDescription">Include project description in context</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInsights"
                  checked={settings.context.includeInsights}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      context: {
                        ...prev.context,
                        includeInsights: checked
                      }
                    }))
                  }
                />
                <Label htmlFor="includeInsights">Include recent insights in context</Label>
              </div>

              <div className="space-y-2">
                <Label>Previous Messages to Include</Label>
                <Select
                  value={settings.context.maxPreviousMessages.toString()}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      context: {
                        ...prev.context,
                        maxPreviousMessages: parseInt(value)
                      }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of messages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="3">Last 3</SelectItem>
                    <SelectItem value="5">Last 5</SelectItem>
                    <SelectItem value="10">Last 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-4">
            <div className="space-y-4">
              {/* Terminology Section */}
              <div>
                <Label className="text-lg font-semibold">Terminology</Label>
                {settings.knowledgeBase.terminology.map((term, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      placeholder="Term"
                      value={term.term}
                      onChange={(e) => {
                        const newTerminology = [...settings.knowledgeBase.terminology];
                        newTerminology[index].term = e.target.value;
                        setSettings(prev => ({
                          ...prev,
                          knowledgeBase: {
                            ...prev.knowledgeBase,
                            terminology: newTerminology
                          }
                        }));
                      }}
                    />
                    <Input
                      placeholder="Definition"
                      value={term.definition}
                      onChange={(e) => {
                        const newTerminology = [...settings.knowledgeBase.terminology];
                        newTerminology[index].definition = e.target.value;
                        setSettings(prev => ({
                          ...prev,
                          knowledgeBase: {
                            ...prev.knowledgeBase,
                            terminology: newTerminology
                          }
                        }));
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newTerminology = settings.knowledgeBase.terminology
                          .filter((_, i) => i !== index);
                        setSettings(prev => ({
                          ...prev,
                          knowledgeBase: {
                            ...prev.knowledgeBase,
                            terminology: newTerminology
                          }
                        }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSettings(prev => ({
                      ...prev,
                      knowledgeBase: {
                        ...prev.knowledgeBase,
                        terminology: [
                          ...prev.knowledgeBase.terminology,
                          { term: '', definition: '' }
                        ]
                      }
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Term
                </Button>
              </div>

              {/* Code Examples Section */}
              <div>
                <Label className="text-lg font-semibold">Code Examples</Label>
                {settings.knowledgeBase.codeExamples.map((example, index) => (
                  <div key={index} className="space-y-2 mt-2 p-4 border rounded-md">
                    <Input
                      placeholder="Title"
                      value={example.title}
                      onChange={(e) => {
                        const newExamples = [...settings.knowledgeBase.codeExamples];
                        newExamples[index].title = e.target.value;
                        setSettings(prev => ({
                          ...prev,
                          knowledgeBase: {
                            ...prev.knowledgeBase,
                            codeExamples: newExamples
                          }
                        }));
                      }}
                    />
                    <Select
                      value={example.language}
                      onValueChange={(value) => {
                        const newExamples = [...settings.knowledgeBase.codeExamples];
                        newExamples[index].language = value;
                        setSettings(prev => ({
                          ...prev,
                          knowledgeBase: {
                            ...prev.knowledgeBase,
                            codeExamples: newExamples
                          }
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Code"
                      value={example.code}
                      onChange={(e) => {
                        const newExamples = [...settings.knowledgeBase.codeExamples];
                        newExamples[index].code = e.target.value;
                        setSettings(prev => ({
                          ...prev,
                          knowledgeBase: {
                            ...prev.knowledgeBase,
                            codeExamples: newExamples
                          }
                        }));
                      }}
                      className="font-mono"
                    />
                    <Textarea
                      placeholder="Description"
                      value={example.description}
                      onChange={(e) => {
                        const newExamples = [...settings.knowledgeBase.codeExamples];
                        newExamples[index].description = e.target.value;
                        setSettings(prev => ({
                          ...prev,
                          knowledgeBase: {
                            ...prev.knowledgeBase,
                            codeExamples: newExamples
                          }
                        }));
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newExamples = settings.knowledgeBase.codeExamples
                          .filter((_, i) => i !== index);
                        setSettings(prev => ({
                          ...prev,
                          knowledgeBase: {
                            ...prev.knowledgeBase,
                            codeExamples: newExamples
                          }
                        }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSettings(prev => ({
                      ...prev,
                      knowledgeBase: {
                        ...prev.knowledgeBase,
                        codeExamples: [
                          ...prev.knowledgeBase.codeExamples,
                          {
                            title: '',
                            language: 'javascript',
                            code: '',
                            description: ''
                          }
                        ]
                      }
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Code Example
                </Button>
              </div>
            </div>
          </TabsContent>



          {/* Requirements Tab - Continued */}
          <TabsContent value="requirements" className="space-y-4">
          <div className="space-y-4">
            {/* Mandatory Elements */}
            <div>
              <Label className="text-lg font-semibold">Mandatory Elements</Label>
              {settings.requirements.mandatoryElements.map((element, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    placeholder="Description"
                    value={element.description}
                    onChange={(e) => {
                      const newElements = [...settings.requirements.mandatoryElements];
                      newElements[index].description = e.target.value;
                      setSettings(prev => ({
                        ...prev,
                        requirements: {
                          ...prev.requirements,
                          mandatoryElements: newElements
                        }
                      }));
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newElements = settings.requirements.mandatoryElements
                        .filter((_, i) => i !== index);
                      setSettings(prev => ({
                        ...prev,
                        requirements: {
                          ...prev.requirements,
                          mandatoryElements: newElements
                        }
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    requirements: {
                      ...prev.requirements,
                      mandatoryElements: [
                        ...prev.requirements.mandatoryElements,
                        { description: '' }
                      ]
                    }
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>

            {/* Technologies */}
            <div>
              <Label className="text-lg font-semibold">Technologies</Label>
              {settings.requirements.technologies.map((tech, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    placeholder="Name"
                    value={tech.name}
                    onChange={(e) => {
                      const newTech = [...settings.requirements.technologies];
                      newTech[index].name = e.target.value;
                      setSettings(prev => ({
                        ...prev,
                        requirements: {
                          ...prev.requirements,
                          technologies: newTech
                        }
                      }));
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Version"
                    value={tech.version}
                    onChange={(e) => {
                      const newTech = [...settings.requirements.technologies];
                      newTech[index].version = e.target.value;
                      setSettings(prev => ({
                        ...prev,
                        requirements: {
                          ...prev.requirements,
                          technologies: newTech
                        }
                      }));
                    }}
                    className="w-32"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={tech.required}
                      onCheckedChange={(checked) => {
                        const newTech = [...settings.requirements.technologies];
                        newTech[index].required = checked;
                        setSettings(prev => ({
                          ...prev,
                          requirements: {
                            ...prev.requirements,
                            technologies: newTech
                          }
                        }));
                      }}
                    />
                    <Label>Required</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newTech = settings.requirements.technologies
                        .filter((_, i) => i !== index);
                      setSettings(prev => ({
                        ...prev,
                        requirements: {
                          ...prev.requirements,
                          technologies: newTech
                        }
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    requirements: {
                      ...prev.requirements,
                      technologies: [
                        ...prev.requirements.technologies,
                        { name: '', version: '', required: true }
                      ]
                    }
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Technology
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Output Tab */}
        <TabsContent value="output" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={settings.outputPreferences.format}
                onValueChange={(value) => 
                  setSettings(prev => ({
                    ...prev,
                    outputPreferences: {
                      ...prev.outputPreferences,
                      format: value
                    }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="plain">Plain Text</SelectItem>
                  <SelectItem value="structured">Structured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Code Block Style</Label>
              <Select
                value={settings.outputPreferences.codeBlockStyle}
                onValueChange={(value) => 
                  setSettings(prev => ({
                    ...prev,
                    outputPreferences: {
                      ...prev.outputPreferences,
                      codeBlockStyle: value
                    }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="documented">Documented</SelectItem>
                  <SelectItem value="verbose">Verbose</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeExamples"
                checked={settings.outputPreferences.includeExamples}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    outputPreferences: {
                      ...prev.outputPreferences,
                      includeExamples: checked
                    }
                  }))
                }
              />
              <Label htmlFor="includeExamples">Include examples in responses</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={() => onOpenChange(false)} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
}

export function ProjectSettingsButton({ project, onSettingsUpdated }) {
const [showSettings, setShowSettings] = React.useState(false);

return (
  <>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setShowSettings(true)}
      className="absolute right-2 top-2"
    >
      <Settings className="h-4 w-4" />
    </Button>

    <ProjectSettings
      open={showSettings}
      onOpenChange={setShowSettings}
      project={project}
      onSave={onSettingsUpdated}
    />
  </>
);
}