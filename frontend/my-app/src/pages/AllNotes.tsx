import React from 'react';
import AllNotesComponent from '../components/AllNotes';

export default function AllNotesPage() {
    return (
        // This div ensures the component can fill the screen correctly.
        <div className="flex w-full h-screen">
            <AllNotesComponent />
        </div>
    );
}