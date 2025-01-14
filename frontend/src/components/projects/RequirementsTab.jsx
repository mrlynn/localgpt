export function RequirementsTab({ settings, setSettings }) {
    return (
      <div className="space-y-4">
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
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
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
    );
  }