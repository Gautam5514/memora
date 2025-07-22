import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

// Import your existing components
import CreateNoteModal from './CreateNoteModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ContentSidebar from './ContentSidebar';
import NoteCard from './NoteCard';
import {
    LoadingSpinner,
    ErrorState,
    EmptyContentState,
    EmptySearchState,
} from './LoadingStates';

// Import your RTK Query hooks and types
import {
    useCreateContentMutation,
    useDeleteContentMutation,
    useUpdateContentMutation,
    useGetAllContentQuery,
    useMeQuery,
} from '../services/api';
import { ContentItem } from '../types';

// This is the main component containing all logic and UI
export default function AllNotesComponent() {
    // --- State management for UI interactions (from your reference) ---
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- RTK Query Hooks (from your reference) ---
    const [createContent, { isLoading: isCreating, error: createError }] = useCreateContentMutation();
    const [deleteContent, { isLoading: isDeleting }] = useDeleteContentMutation();
    const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
    const { data, isLoading, error } = useGetAllContentQuery();
    const { data: userDataResponse } = useMeQuery();

    // --- Loading and Error States ---
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorState />;

    // Safely handle the nested data structure from your API
    const contentData: ContentItem[] = (data && Array.isArray(data.data)) ? data.data : [];
    const userData = userDataResponse?.data;

    // Initial empty state (when there are no notes at all and no search query)
    if (contentData.length === 0 && !searchQuery) {
        return <EmptyContentState onCreateNote={() => setShowCreateModal(true)} />;
    }

    const filteredContent = contentData.filter(item =>
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Event Handlers (logic from your reference) ---
    const handleEdit = (id: string, content: string) => {
        setEditingId(id);
        setEditContent(content);
    };

    const handleSave = async (id: string) => {
        if (!editContent.trim()) {
            toast.error("Note cannot be empty.");
            return;
        }
        try {
            await updateContent({ id, content: { content: editContent } }).unwrap();
            toast.success("Note updated successfully!");
            setEditingId(null);
            setEditContent('');
        } catch (err) {
            toast.error("Failed to update note.");
            console.error('Failed to update content:', err);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleDelete = (id: string) => {
        setDeleteItemId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteItemId) return;
        try {
            await deleteContent(deleteItemId).unwrap();
            toast.success("Note deleted successfully!");
            setShowDeleteModal(false);
            setDeleteItemId(null);
        } catch (err) {
            toast.error("Failed to delete note.");
            console.error('Failed to delete content:', err);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeleteItemId(null);
    };

    const handleCreateNote = async () => {
        if (!newContent.trim()) return;
        try {
            await createContent({ content: newContent }).unwrap();
            toast.success("Note created successfully!");
            setNewContent('');
            setShowCreateModal(false);
        } catch (err) {
            toast.error("Failed to create note.");
            console.error('Failed to create content:', err);
        }
    };

    return (
        <>
            {/* Left Sidebar */}
            <ContentSidebar
                userData={userData}
                contentData={contentData}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeTab="all" // This page is always on the 'all' tab
                onTabChange={() => { }} // No-op as tab changing isn't needed here
                onCreateNote={() => setShowCreateModal(true)}
            />

            {/* Right Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
                {/* Sticky Header */}
                <header className="sticky top-0 z-10 flex-shrink-0 border-b border-gray-200 bg-white/75 backdrop-blur-lg">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-baseline space-x-3">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">All Notes</h1>
                                <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                    {filteredContent.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-black"
                            >
                                <Plus className="h-5 w-5" />
                                <span>New Note</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {searchQuery && filteredContent.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center h-full">
                            <EmptySearchState onCreateNote={() => setShowCreateModal(true)} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredContent.map((item: ContentItem) => (
                                <NoteCard
                                    key={item._id}
                                    item={item}
                                    isEditing={editingId === item._id}
                                    editContent={editContent}
                                    isUpdating={isUpdating && editingId === item._id}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onSave={() => handleSave(item._id)}
                                    onCancel={handleCancel}
                                    onEditContentChange={setEditContent}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modals rendered at the top level to act as overlays */}
            <CreateNoteModal
                show={showCreateModal}
                newContent={newContent}
                isCreating={isCreating}
                createError={!!createError}
                onContentChange={setNewContent}
                onCancel={() => { setShowCreateModal(false); setNewContent(''); }}
                onCreate={handleCreateNote}
            />
            <DeleteConfirmModal
                show={showDeleteModal}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </>
    );
}