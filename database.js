/* ============================================================
   WAP DATABASE ENGINE & SUPABASE CONNECTIVITY
============================================================ */

class DatabaseService {
  constructor() {
    this.supabaseClient = null;
    this.initSupabase();
  }

  initSupabase() {
    let url = localStorage.getItem('wap_supabase_url');
    let key = localStorage.getItem('wap_supabase_key');

    // Default to your live Supabase credentials if no local override is configured in browser
    if (!url || !key) {
      url = "https://bfyvcdfzjsojjkgcirpx.supabase.co";
      key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeXZjZGZ6anNvamprZ2NpcnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzUyODYsImV4cCI6MjA5NTIxMTI4Nn0.2hcYSA8xm3YI5e0ValM36LSgNdpduWCCVUMSknOnbVM";
    }

    if (url && key) {
      try {
        // Supabase is loaded globally via CDN script in our HTML files
        if (typeof supabase !== 'undefined') {
          this.supabaseClient = supabase.createClient(url, key);
          console.log("Supabase Client initialized successfully!");
        } else {
          console.warn("Supabase library not loaded yet. Retrying in 100ms...");
          setTimeout(() => this.initSupabase(), 100);
        }
      } catch (err) {
        console.error("Error creating Supabase client:", err);
      }
    }
  }

  // Helper: Save Supabase keys and test connectivity
  saveSupabaseConfig(url, key) {
    if (!url || !key) {
      localStorage.removeItem('wap_supabase_url');
      localStorage.removeItem('wap_supabase_key');
      this.supabaseClient = null;
      this.initSupabase();
      return { success: true, message: "Cleared Supabase keys. Switched to default Supabase instance." };
    }

    try {
      localStorage.setItem('wap_supabase_url', url);
      localStorage.setItem('wap_supabase_key', key);
      this.initSupabase();
      return { success: true, message: "Supabase configuration updated and saved!" };
    } catch (err) {
      return { success: false, message: "Failed to configure Supabase: " + err.message };
    }
  }

  // 3. Profiles & Users CRUD
  async registerUser(userData) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data, error } = await this.supabaseClient
        .from('registers')
        .insert([{
          name: userData.full_name,
          business_name: userData.company,
          domain: userData.domain,
          maid_id: userData.email, // maps to maid_id
          phone_number: userData.mobile,
          years_of_experience: parseInt(userData.experience) || 0,
          business_partner_details: userData.designation,
          address: userData.city,
          office_address: userData.website || "",
          office_number: userData.utr || "0",
          profile_photo: userData.avatar_url || ""
        }]);
      
      if (error) throw error;
      
      return { 
        success: true, 
        user: {
          id: userData.email,
          email: userData.email,
          full_name: userData.full_name,
          company: userData.company,
          domain: userData.domain,
          designation: userData.designation,
          experience: userData.experience,
          mobile: userData.mobile,
          city: userData.city,
          website: userData.website,
          avatar_url: userData.avatar_url || ""
        }
      };
    } catch (err) {
      console.error("Supabase Profile Registration Error:", err);
      return { success: false, message: err.message };
    }
  }

  async loginUser(email, password) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data, error } = await this.supabaseClient
        .from('registers')
        .select('*')
        .eq('maid_id', email)
        .single();

      if (error || !data) {
        throw new Error(error ? error.message : "User profile not found in Supabase registers table.");
      }
      
      const mappedUser = {
        id: data.maid_id,
        email: data.maid_id,
        full_name: data.name,
        company: data.business_name,
        domain: data.domain,
        designation: data.business_partner_details,
        experience: data.years_of_experience + " Years",
        mobile: data.phone_number,
        city: data.address,
        website: data.office_address,
        avatar_url: data.profile_photo || ""
      };

      return { success: true, user: mappedUser };
    } catch (err) {
      console.error("Supabase Login Error:", err);
      return { success: false, message: err.message };
    }
  }

  async getProfile(userId) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data, error } = await this.supabaseClient
        .from('registers')
        .select('*')
        .eq('maid_id', userId)
        .single();
        
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.maid_id,
        email: data.maid_id,
        full_name: data.name,
        company: data.business_name,
        domain: data.domain,
        designation: data.business_partner_details,
        experience: data.years_of_experience + " Years",
        mobile: data.phone_number,
        city: data.address,
        website: data.office_address,
        avatar_url: data.profile_photo || ""
      };
    } catch (err) {
      console.error("Supabase Get Profile Error:", err);
      return null;
    }
  }

  async getAllMembers() {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data, error } = await this.supabaseClient
        .from('registers')
        .select('*');
        
      if (error) throw error;
      
      return data.map(d => ({
        id: d.maid_id,
        email: d.maid_id,
        full_name: d.name,
        company: d.business_name,
        domain: d.domain,
        designation: d.business_partner_details,
        experience: d.years_of_experience + " Years",
        mobile: d.phone_number,
        city: d.address,
        website: d.office_address,
        avatar_url: d.profile_photo || ""
      }));
    } catch (err) {
      console.error("Supabase Get Members Error:", err);
      return [];
    }
  }

  // 4. Feed & Posts CRUD
  async createPost(postData) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data, error } = await this.supabaseClient
        .from('posts')
        .insert([{
          id: postData.id,
          user_id: postData.user_id,
          author_name: postData.author_name,
          author_company: postData.author_company,
          type: postData.type,
          content: postData.content,
          likes_count: 0
        }]);
        
      if (error) throw error;
      return { success: true, post: postData };
    } catch (err) {
      console.error("Supabase Create Post Error:", err);
      return { success: false, message: err.message };
    }
  }

  async getAllPosts() {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data, error } = await this.supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase Get Posts Error:", err);
      return [];
    }
  }

  async likePost(postId) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data: post } = await this.supabaseClient.from('posts').select('likes_count').eq('id', postId).single();
      const nextLikes = (post?.likes_count || 0) + 1;
      
      const { error } = await this.supabaseClient
        .from('posts')
        .update({ likes_count: nextLikes })
        .eq('id', postId);
        
      if (error) throw error;
      return nextLikes;
    } catch (err) {
      console.error("Supabase Like Post Error:", err);
      return 0;
    }
  }

  // 5. Connections Management
  async connectUsers(userId, targetUserId) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const connectionId = `conn_${userId}_${targetUserId}`;
      const { error } = await this.supabaseClient
        .from('connections')
        .insert([{
          id: connectionId,
          user_id: userId,
          connected_user_id: targetUserId,
          status: "connected"
        }]);
        
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Supabase Connection Error:", err);
      return { success: false, message: err.message };
    }
  }

  async getConnections(userId) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data, error } = await this.supabaseClient
        .from('connections')
        .select('*')
        .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase Get Connections Error:", err);
      return [];
    }
  }

  // 6. Events & RSVPs
  async createRsvp(rsvpData) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { error } = await this.supabaseClient
        .from('rsvps')
        .insert([{
          id: rsvpData.id,
          user_id: rsvpData.user_id,
          user_name: rsvpData.user_name,
          event_id: rsvpData.event_id,
          amount: rsvpData.amount,
          utr_number: rsvpData.utr_number,
          status: 'pending'
        }]);
        
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Supabase RSVP Error:", err);
      return { success: false, message: err.message };
    }
  }

  async getRsvps(userId) {
    try {
      if (!this.supabaseClient) throw new Error("Supabase client not initialized.");
      
      const { data, error } = await this.supabaseClient
        .from('rsvps')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase Get RSVPs Error:", err);
      return [];
    }
  }
}

// Export database client instance to the window
window.WapDB = new DatabaseService();
