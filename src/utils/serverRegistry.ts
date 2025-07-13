// Server Registry API utilities

interface ServerInfo {
  bridge_url: string;
}

interface LinkServerRequest {
  server_token: string;
}

class ServerRegistryAPI {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_SERVER_REGISTRY_URL || '';
    if (!this.baseURL) {
      throw new Error('NEXT_PUBLIC_SERVER_REGISTRY_URL is not configured');
    }
  }

  private async makeRequest(
    endpoint: string, 
    options: {
      method: 'GET' | 'POST';
      headers?: Record<string, string>;
      body?: string;
    },
    userID: string
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'User-ID': userID,
      ...options.headers
    };

    return await fetch(url, {
      method: options.method,
      headers,
      body: options.body
    });
  }

  async createUser(userID: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.makeRequest('/api/v1/user/create', {
        method: 'POST'
      }, userID);

      if (response.status === 201) {
        return { success: true, message: 'User created successfully' };
      } else if (response.status === 200) {
        return { success: true, message: 'User already exists' };
      } else if (response.status === 400) {
        return { success: false, message: 'Invalid or missing User-ID' };
      } else {
        return { success: false, message: `Unexpected status: ${response.status}` };
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async getUserServer(userID: string): Promise<{ success: boolean; data?: ServerInfo; message?: string }> {
    try {
      const response = await this.makeRequest('/api/v1/user/server', {
        method: 'GET'
      }, userID);

      if (response.status === 200) {
        const data = await response.json() as ServerInfo;
        return { success: true, data };
      } else if (response.status === 400) {
        return { success: false, message: 'Invalid or missing User-ID' };
      } else {
        return { success: false, message: `Unexpected status: ${response.status}` };
      }
    } catch (error) {
      console.error('Error getting user server:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async linkServer(userID: string, serverToken: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.makeRequest('/api/v1/user/link-server', {
        method: 'POST',
        body: JSON.stringify({ server_token: serverToken } as LinkServerRequest)
      }, userID);

      if (response.status === 200) {
        return { success: true, message: 'Server linked successfully' };
      } else if (response.status === 400) {
        return { success: false, message: 'Invalid request or missing User-ID' };
      } else if (response.status === 404) {
        return { success: false, message: 'Server with this token not found' };
      } else {
        return { success: false, message: `Unexpected status: ${response.status}` };
      }
    } catch (error) {
      console.error('Error linking server:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async unlinkServer(userID: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.makeRequest('/api/v1/user/unlink-server', {
        method: 'POST',
      }, userID);

      if (response.status === 200) {
        return { success: true, message: 'Server linked successfully' };
      } else if (response.status === 400) {
        return { success: false, message: 'Invalid request or missing User-ID' };
      } else if (response.status === 404) {
        return { success: false, message: 'User not found' };
      } else {
        return { success: false, message: `Unexpected status: ${response.status}` };
      }
    } catch (error) {
      console.error('Error linking server:', error);
      return { success: false, message: 'Network error' };
    }
  }
}

export const serverRegistryAPI = new ServerRegistryAPI();
export type { ServerInfo, LinkServerRequest };