export function OutputTab({ settings, setSettings }) {
    return (
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
    );
  }