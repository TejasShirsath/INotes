import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar,
  Clock,
  X,
  Save,
  Tag,
  Star,
  BookOpen
} from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface NewNoteForm {
  title: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const { user, logout, isLoading } = useAuth0();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteForm, setNewNoteForm] = useState<NewNoteForm>({ title: '', description: '' });
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [filterOption, setFilterOption] = useState('all');
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalEntering, setIsModalEntering] = useState(false);

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
  };

  const fetchUserProfile = async () => {
    try {
      console.log('🔄 Creating user profile from Auth0 user data...');
      console.log('👤 User object:', user);
      
      // Instead of getting a token, use the user data directly from Auth0
      if (user) {
        const userData = {
          auth0Id: user.sub,
          email: user.email,
          name: user.name || user.nickname,
          picture: user.picture
        };
        
        console.log('� Sending user data to backend:', userData);
        
        // Send user data directly to backend
        const response = await fetch('http://localhost:8000/api/auth0/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ User profile created/updated:', result);
          
          // After successful profile creation, fetch notes using Auth0 user ID
          fetchNotesWithUserId(user.sub!);
        } else {
          console.error('❌ Failed to create user profile:', response.status);
        }
      }
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
    }
  };

  const fetchNotesWithUserId = async (userId: string) => {
    try {
      setIsLoadingNotes(true);
      const response = await fetch(`http://localhost:8000/api/notes/user/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
        console.log('✅ Notes fetched successfully');
      } else {
        console.error('❌ Failed to fetch notes:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const createNote = async () => {
    if (!newNoteForm.title.trim() || !newNoteForm.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    if (!user?.sub) {
      alert('User authentication error. Please try logging in again.');
      return;
    }

    try {
      setIsCreatingNote(true);
      const response = await fetch(`http://localhost:8000/api/notes/user/${encodeURIComponent(user.sub)}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNoteForm.title,
          description: newNoteForm.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Note created successfully:', data);
        setNewNoteForm({ title: '', description: '' });
        setShowNewNoteModal(false);
        
        // Refresh notes
        fetchNotesWithUserId(user.sub);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create note:', response.status, errorData);
        alert(`Failed to create note: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('❌ Error creating note:', error);
      alert('Error creating note. Please try again.');
    } finally {
      setIsCreatingNote(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    if (!user?.sub) {
      alert('User authentication error. Please try logging in again.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/notes/user/${encodeURIComponent(user.sub)}/${noteId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log('✅ Note deleted successfully');
        // Refresh notes
        fetchNotesWithUserId(user.sub);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to delete note:', response.status, errorData);
        alert(`Failed to delete note: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowNewNoteModal(false);
      setIsModalClosing(false);
      setNewNoteForm({ title: '', description: '' });
    }, 200); // Match the transition duration
  };

  const openModal = () => {
    setShowNewNoteModal(true);
    setIsModalEntering(true);
    // Small delay to trigger the entrance animation
    setTimeout(() => {
      setIsModalEntering(false);
    }, 50);
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Remove the old useEffect that checks for token and replace with user-based fetching
  // useEffect(() => {
  //   const token = localStorage.getItem('auth0_token');
  //   if (token) {
  //     fetchNotes();
  //   }
  // }, []);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterOption === 'recent') {
      const noteDate = new Date(note.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && noteDate >= weekAgo;
    }
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg">
            <div className="py-0.5 px-6 sm:px-8 lg:px-12">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-3xl font-bold text-indigo-600">iNotes</h1>
                  </div>
                </div>

                {/* User Profile Section */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user?.picture}
                      alt={user?.name || 'User'}
                      className="w-10 h-10 rounded-full border-2 border-indigo-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=40`;
                      }}
                    />
                    <div className="hidden sm:block">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.name || user?.email}
                      </span>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.given_name || user?.name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your notes and stay organized with iNotes.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button 
            onClick={openModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
          
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors appearance-none bg-white pr-8"
              >
                <option value="all">All Notes</option>
                <option value="recent">Recent (7 days)</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingNotes ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div key={note._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {note.title}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteNote(note._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-4 leading-relaxed">
                  {note.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      Note
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Enhanced empty state
            <div className="col-span-full text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? 'No notes found' : 'Start your note-taking journey'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? `No notes match "${searchTerm}". Try adjusting your search terms.`
                  : 'Create your first note to organize your thoughts, ideas, and important information.'
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={openModal}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Create your first note
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div 
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300 ${
            isModalClosing || isModalEntering ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
              isModalClosing || isModalEntering
                ? 'scale-95 opacity-0 translate-y-4' 
                : 'scale-100 opacity-100 translate-y-0'
            }`}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Note</h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  id="note-title"
                  type="text"
                  value={newNoteForm.title}
                  onChange={(e) => setNewNoteForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter note title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              
              <div>
                <label htmlFor="note-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="note-description"
                  value={newNoteForm.description}
                  onChange={(e) => setNewNoteForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Write your note content here..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <button
                onClick={closeModal}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 font-medium transform hover:scale-105 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={createNote}
                disabled={isCreatingNote || !newNoteForm.title.trim() || !newNoteForm.description.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:transform-none"
              >
                {isCreatingNote ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
