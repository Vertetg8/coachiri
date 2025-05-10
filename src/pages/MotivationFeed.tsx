import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MotivationPost, UserFavorite } from '../types';
import { PlusCircle } from 'lucide-react';
import MotivationCard from '../components/motivation/MotivationCard';

const MotivationFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<MotivationPost[]>([]);
  const [userFavorites, setUserFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch motivation posts
        const { data: postsData, error: postsError } = await supabase
          .from('daily_motivation')
          .select('*')
          .order('post_date', { ascending: false });
        
        if (postsError) {
          console.error('Error fetching motivation posts:', postsError);
          return;
        }
        
        if (postsData) {
          setPosts(postsData);
        }
        
        // Fetch user favorites
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.user_id);
        
        if (favoritesError) {
          console.error('Error fetching user favorites:', favoritesError);
          return;
        }
        
        if (favoritesData) {
          setUserFavorites(favoritesData);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleToggleFavorite = (postId: string, isFavorited: boolean) => {
    if (isFavorited) {
      // Add to local state
      const newFavorite: UserFavorite = {
        favorite_id: Math.random().toString(), // This is temporary, database will assign real ID
        user_id: user?.user_id || '',
        post_id: postId,
        date_favorited: new Date().toISOString(),
      };
      setUserFavorites([...userFavorites, newFavorite]);
    } else {
      // Remove from local state
      setUserFavorites(userFavorites.filter(fav => fav.post_id !== postId));
    }
  };
  
  const filteredPosts = filter === 'all' 
    ? posts
    : posts.filter(post => userFavorites.some(fav => fav.post_id === post.post_id));
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-primary-500 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Daily Motivation</h1>
          <p className="mt-4 text-xl text-gray-600">
            Please sign in to view motivational content.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="btn btn-primary inline-flex items-center py-3 px-6 text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Daily Motivation</h1>
        <p className="mt-2 text-lg text-gray-600">
          Daily inspiration to keep you motivated on your fitness journey.
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('all')}
          >
            All Posts
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              filter === 'favorites'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('favorites')}
          >
            My Favorites
          </button>
        </div>
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          {filter === 'all' ? (
            <p className="text-gray-600">
              No motivation posts available at the moment. Check back soon!
            </p>
          ) : (
            <p className="text-gray-600">
              You haven't favorited any posts yet. Browse the "All Posts" section and mark your favorites.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredPosts.map(post => (
            <MotivationCard
              key={post.post_id}
              post={post}
              userId={user.user_id}
              userFavorites={userFavorites}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MotivationFeed;