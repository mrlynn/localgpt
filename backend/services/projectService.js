class ProjectService {
    constructor(config = {}) {
      this.isMongoDBEnabled = !!(config.mongodbUri || process.env.MONGODB_URI);
    }
  
    async createProject(name, description = '') {
      if (!this.isMongoDBEnabled) {
        throw new Error('MongoDB is required for project support');
      }
  
      const project = new Project({
        name,
        description
      });
  
      return await project.save();
    }
  
    async getAllProjects() {
      if (!this.isMongoDBEnabled) {
        throw new Error('MongoDB is required for project support');
      }
  
      return await Project.find().sort({ updatedAt: -1 });
    }
  
    async getProject(projectId) {
      if (!this.isMongoDBEnabled) {
        throw new Error('MongoDB is required for project support');
      }
  
      return await Project.findById(projectId);
    }
  
    async updateProject(projectId, updates) {
      if (!this.isMongoDBEnabled) {
        throw new Error('MongoDB is required for project support');
      }
  
      return await Project.findByIdAndUpdate(
        projectId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
    }
  
    async deleteProject(projectId) {
      if (!this.isMongoDBEnabled) {
        throw new Error('MongoDB is required for project support');
      }
  
      // Delete the project and all associated chats
      await Chat.deleteMany({ projectId });
      return await Project.findByIdAndDelete(projectId);
    }
  }
  
  export default ProjectService;