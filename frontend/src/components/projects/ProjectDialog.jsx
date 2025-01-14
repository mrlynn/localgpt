// /frontend/src/components/projects/ProjectDialog.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

export function ProjectDialog({ open, onOpenChange, project = null, onSubmit }) {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    config: {
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
      outputPreferences: {
        format: 'markdown',
        includeExamples: true,
        codeBlockStyle: 'documented'
      },
      knowledgeBase: {
        terminology: [],
        codeExamples: []
      },
      requirements: {
        mandatoryElements: [],
        technologies: []
      }
    }
  });

  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        config: project.config || formData.config
      });
    } else {
      // Reset form when creating new project
      setFormData({
        name: '',
        description: '',
        config: {
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
          outputPreferences: {
            format: 'markdown',
            includeExamples: true,
            codeBlockStyle: 'documented'
          },
          knowledgeBase: {
            terminology: [],
            codeExamples: []
          },
          requirements: {
            mandatoryElements: [],
            technologies: []
          }
        }
      });
    }
  }, [project, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="style">Style & Context</TabsTrigger>
              <TabsTrigger value="output">Output Settings</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Style & Context Tab */}
            <TabsContent value="style" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Communication Style</Label>
                  <Select
                    value={formData.config.style.tone}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        style: {
                          ...prev.config.style,
                          tone: value
                        }
                      }
                    }))}
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
                    value={formData.config.style.languageLevel}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        style: {
                          ...prev.config.style,
                          languageLevel: value
                        }
                      }
                    }))}
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
                    value={formData.config.style.codeStyle}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        style: {
                          ...prev.config.style,
                          codeStyle: value
                        }
                      }
                    }))}
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDescription"
                    checked={formData.config.context.includeProjectDescription}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        context: {
                          ...prev.config.context,
                          includeProjectDescription: checked
                        }
                      }
                    }))}
                  />
                  <Label htmlFor="includeDescription">Include project description in context</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeInsights"
                    checked={formData.config.context.includeInsights}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        context: {
                          ...prev.config.context,
                          includeInsights: checked
                        }
                      }
                    }))}
                  />
                  <Label htmlFor="includeInsights">Include insights in context</Label>
                </div>
              </div>
            </TabsContent>

            {/* Output Settings Tab */}
            <TabsContent value="output" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select
                    value={formData.config.outputPreferences.format}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        outputPreferences: {
                          ...prev.config.outputPreferences,
                          format: value
                        }
                      }
                    }))}
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
                    value={formData.config.outputPreferences.codeBlockStyle}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        outputPreferences: {
                          ...prev.config.outputPreferences,
                          codeBlockStyle: value
                        }
                      }
                    }))}
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
                    checked={formData.config.outputPreferences.includeExamples}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        outputPreferences: {
                          ...prev.config.outputPreferences,
                          includeExamples: checked
                        }
                      }
                    }))}
                  />
                  <Label htmlFor="includeExamples">Include examples in responses</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}