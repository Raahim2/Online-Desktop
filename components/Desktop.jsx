'use client';

import { useState, MouseEvent, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import PropTypes from 'prop-types'; // Import PropTypes for prop validation
import {
    FolderIcon, ComputerDesktopIcon, ServerIcon, ChevronRightIcon, ChevronDownIcon,
    ChevronUpIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, MagnifyingGlassIcon,
    ViewColumnsIcon, Bars3Icon, EllipsisHorizontalIcon, InformationCircleIcon, SparklesIcon,
    ScissorsIcon, DocumentIcon, ClipboardIcon, PencilSquareIcon, ShareIcon, TrashIcon,
    BarsArrowDownIcon, EyeIcon, ListBulletIcon, TagIcon, DocumentDuplicateIcon,
    Squares2X2Icon, QueueListIcon, WindowIcon, TableCellsIcon, Bars4Icon, CheckIcon,
    ArrowUpIcon, // For Ascending/Descending visual
    ArrowDownIcon, // For Ascending/Descending visual
} from '@heroicons/react/24/outline';
import { StopIcon } from '@heroicons/react/20/solid'; // Placeholder Icon


const parseDate = (dateString) => {
    // Basic check for expected format DD-MM-YYYY HH:MM
    if (!/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(dateString)) {
       // console.warn(`Invalid date format encountered: ${dateString}`);
       return new Date(0); // Return epoch for invalid formats
    }
    const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
    if (!parts) return new Date(0); // Should not happen due to regex, but safe fallback
    // parts[0] is the full match, parts[1]=DD, parts[2]=MM, parts[3]=YYYY, parts[4]=HH, parts[5]=MM
    // Month is 0-indexed in JS Date constructor (0 = January)
    return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]);
};


// Define the default list of files outside the component if it's static
const defaultFileItems = [
    { name: 'Android Development', date: '18-04-2025 21:01', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'Artificial Intellegence', date: '18-04-2025 20:17', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'DEMO FOR PROJECTS', date: '04-08-2024 16:08', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'Desktop App', date: '11-04-2025 20:19', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'Django Flask', date: '03-02-2025 19:48', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'DJSCE', date: '23-03-2025 15:41', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'Hackerthon', date: '14-10-2024 19:13', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'Machine Learning', date: '17-10-2024 21:18', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'React-Next', date: '20-04-2025 13:13', type: 'File folder', size: null, icon: FolderIcon },
    { name: 'Web Development', date: '19-04-2025 16:46', type: 'File folder', size: null, icon: FolderIcon },
    { name: '.env', date: '07-01-2025 19:49', type: 'Text Source File', size: '1 KB', icon: TagIcon },
];

// Define the component, accepting 'folders' prop
export default function Desktop({ folders = null }) { // Default prop to null
    const router = useRouter(); // Initialize router

    // Use useMemo to decide which file list to use based on the 'folders' prop
    const fileList = useMemo(() => {
        // Check if 'folders' is a non-empty array of strings
        if (Array.isArray(folders) && folders.length > 0 && folders.every(f => typeof f === 'string')) {
            // Generate file objects from the folder names prop
            return folders.map(folderName => ({
                name: folderName,
                date: '18-04-2025 21:01', // Default date as requested
                type: 'File folder',       // Default type as requested
                size: null,               // Default size as requested
                icon: FolderIcon          // Default icon as requested
            }));
            // Note: This replaces the entire default list.
            // If you wanted to *add* these folders to the default list or keep '.env', adjust logic here.
            // Example: To always include .env:
            // const propFolders = folders.map(...)
            // propFolders.push(defaultFileItems.find(f => f.name === '.env'));
            // return propFolders;
        } else {
            // If 'folders' prop is not valid or empty, use the default list
            if (folders !== null && (!Array.isArray(folders) || !folders.every(f => typeof f === 'string'))) {
               console.warn("Desktop component received invalid 'folders' prop. Expected array of strings. Using default files.");
            }
            return defaultFileItems;
        }
    }, [folders]); // Dependency: recalculate if 'folders' prop changes

    // Remove useState for files, use fileList directly
    // const [files] = useState(initialFiles); // Removed

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fileListRef = useRef(null);

    // --- State for View Options ---
    const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
    const [viewMode, setViewMode] = useState('details');
    const [showDetailsPane, setShowDetailsPane] = useState(true);
    const viewDropdownRef = useRef(null);
    const viewButtonRef = useRef(null);

    // --- State for Sort Options ---
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [sortCriteria, setSortCriteria] = useState('name'); // 'name', 'date', 'type'
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'
    const sortDropdownRef = useRef(null);
    const sortButtonRef = useRef(null);


    // --- Combined Filtering and Sorting ---
    // This now depends on `fileList` instead of the removed `files` state
    const sortedAndFilteredFiles = useMemo(() => {
        // 1. Filter
        let processedFiles = fileList; // Use fileList directly
        if (searchTerm) {
            processedFiles = fileList.filter(file => // Use fileList directly
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sort (Create a mutable copy for sorting)
        const filesToSort = [...processedFiles];
        filesToSort.sort((a, b) => {
            let compareA, compareB;

            switch (sortCriteria) {
                case 'date':
                    compareA = parseDate(a.date);
                    compareB = parseDate(b.date);
                    break;
                case 'type':
                    compareA = a.type.toLowerCase();
                    compareB = b.type.toLowerCase();
                    break;
                case 'name':
                default:
                    compareA = a.name.toLowerCase();
                    compareB = b.name.toLowerCase();
                    break;
            }

            let comparison = 0;
            if (compareA > compareB) {
                comparison = 1;
            } else if (compareA < compareB) {
                comparison = -1;
            }
            // Handle invalid dates (epoch) - maybe sort them to the end?
             if (sortCriteria === 'date') {
                if (compareA.getTime() === 0 && compareB.getTime() !== 0) return 1; // a is invalid, b is valid -> a comes after
                if (compareA.getTime() !== 0 && compareB.getTime() === 0) return -1; // a is valid, b is invalid -> a comes before
            }


            return sortDirection === 'desc' ? comparison * -1 : comparison;
        });

        return filesToSort;
    }, [fileList, searchTerm, sortCriteria, sortDirection]); // Re-run if any dependency changes


    // --- Click Handlers ---
    const handleFileClick = (event, fileName) => {
        event.stopPropagation();

        // Find index in the *currently displayed* list
        const actualIndexInDisplayedList = sortedAndFilteredFiles.findIndex(f => f.name === fileName);
        if (actualIndexInDisplayedList === -1) return; // Should not happen, but safety check

        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        if (isShiftPressed && lastSelectedIndex !== null && lastSelectedIndex < sortedAndFilteredFiles.length) {
             const startFilteredIndex = Math.min(lastSelectedIndex, actualIndexInDisplayedList);
             const endFilteredIndex = Math.max(lastSelectedIndex, actualIndexInDisplayedList);
             // Ensure indices are within bounds of the currently displayed list
             if (startFilteredIndex >= 0 && endFilteredIndex < sortedAndFilteredFiles.length) {
                const rangeSelection = sortedAndFilteredFiles.slice(startFilteredIndex, endFilteredIndex + 1).map(file => file.name);
                if (isCtrlPressed) {
                    // Add range to existing selection without duplicates
                    setSelectedFiles(prev => [...new Set([...prev, ...rangeSelection])]);
                } else {
                    // Replace selection with range
                    setSelectedFiles(rangeSelection);
                }
             } else {
                 // Fallback to single selection if indices are bad (e.g., after filtering/sorting)
                 setSelectedFiles([fileName]);
                 setLastSelectedIndex(actualIndexInDisplayedList);
             }

        } else if (isCtrlPressed) {
            setSelectedFiles(prevSelected =>
                prevSelected.includes(fileName)
                    ? prevSelected.filter(name => name !== fileName)
                    : [...prevSelected, fileName]
            );
            setLastSelectedIndex(actualIndexInDisplayedList);
        } else {
            setSelectedFiles([fileName]);
            setLastSelectedIndex(actualIndexInDisplayedList);
        }
    };

    // --- Double Click Handler for Navigation ---
    const handleDoubleClick = (file) => {
        if (file.type === 'File folder') {
            // Basic encoding, consider more robust URL slug generation if needed
            router.push(`projects/${encodeURIComponent(file.name)}`);
        }
        // Could add logic for opening files here too
    };


    const handleBackgroundClick = () => {
        setSelectedFiles([]);
        setLastSelectedIndex(null);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // Reset selection when search changes? Optional, maybe confusing.
        // setSelectedFiles([]);
        // setLastSelectedIndex(null);
    };

    const handleViewOptionClick = (mode) => {
        setViewMode(mode);
        setIsViewDropdownOpen(false);
    };

    const toggleDetailsPane = () => {
        setShowDetailsPane(prev => !prev);
        setIsViewDropdownOpen(false);
    };

    const handleSortCriteriaClick = (criteria) => {
        if (criteria === sortCriteria) {
             // If clicking the same criteria, toggle direction
             setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            // If clicking a new criteria, set it and default to ascending
            setSortCriteria(criteria);
            setSortDirection('asc');
        }
        setIsSortDropdownOpen(false); // Close dropdown after selection
    };

    const handleSortDirectionClick = (direction) => {
        setSortDirection(direction);
        setIsSortDropdownOpen(false); // Close dropdown after selection
    };

    // --- Effect to close dropdowns on outside click ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close View Dropdown
            if (
                isViewDropdownOpen &&
                viewDropdownRef.current && !viewDropdownRef.current.contains(event.target) &&
                viewButtonRef.current && !viewButtonRef.current.contains(event.target)
            ) {
                setIsViewDropdownOpen(false);
            }
            // Close Sort Dropdown
            if (
                isSortDropdownOpen &&
                sortDropdownRef.current && !sortDropdownRef.current.contains(event.target) &&
                sortButtonRef.current && !sortButtonRef.current.contains(event.target)
            ) {
                setIsSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
        // Dependencies include both dropdown states
    }, [isViewDropdownOpen, isSortDropdownOpen]);


    // --- Status Bar Text ---
    const getStatusBarText = () => {
        const selectedCount = selectedFiles.length;
        if (selectedCount > 0) {
            // Find selected files in the *original* list to potentially get more details if needed
             const actualSelectedFilesData = fileList.filter(f => selectedFiles.includes(f.name));
             // Example: Calculate total size (if available)
             // const totalSize = actualSelectedFilesData.reduce((sum, file) => sum + (parseInt(file.size) || 0), 0);
             // For now, just count
             return selectedCount === 1 ? `1 item selected` : `${selectedCount} items selected`;
        }
        const visibleCount = sortedAndFilteredFiles.length; // Count of currently visible items
        const totalCount = fileList.length; // Total items before filtering

        if (searchTerm) {
            return `${visibleCount} item${visibleCount !== 1 ? 's' : ''} found (${totalCount} total)`;
        } else {
             return visibleCount === 1 ? `1 item` : `${visibleCount} items`;
        }
    };

    // --- Render Details Pane ---
    const renderDetailsPane = () => {
        const count = selectedFiles.length;
        if (count === 0) {
             // Use fileList.length for total count before filtering
             const totalItemCount = fileList.length;
             const visibleItemCount = sortedAndFilteredFiles.length;
             const countText = searchTerm ? `${visibleItemCount} of ${totalItemCount}` : totalItemCount;

             return (
                <>
                    <FolderIcon className="w-24 h-24 text-yellow-400 opacity-80 mb-4" />
                    {/* Update title dynamically */}
                    <h3 className="font-semibold text-gray-800 mb-1">VibeCoding ({countText} items)</h3>
                    <div className="bg-white border border-gray-200 rounded p-3 text-xs text-gray-600 flex items-start space-x-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Select a single file to get more information and share your cloud content.</span>
                    </div>
                </>
            );
        } else if (count === 1) {
             // Find the selected file in the master list (`fileList`) to ensure correct data
            const selectedFile = fileList.find(f => f.name === selectedFiles[0]);
            if (!selectedFile) return null; // Should not happen
            const IconComponent = selectedFile.icon;
            return (
                <>
                    <IconComponent className={`w-24 h-24 mb-4 ${selectedFile.type === 'File folder' ? 'text-yellow-500' : 'text-gray-500'}`} />
                    <h3 className="font-semibold text-gray-800 mb-1 break-words w-full px-2" title={selectedFile.name}>{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{selectedFile.type}</p>
                    <p className="text-xs text-gray-500 mb-1">Date modified: {selectedFile.date}</p>
                    {selectedFile.size && <p className="text-xs text-gray-500">Size: {selectedFile.size}</p>}
                     {/* Add placeholder actions if needed */}
                     {/* <div className="mt-4 space-y-2">
                         <button className="text-blue-600 hover:underline text-xs">Open</button>
                         <button className="text-blue-600 hover:underline text-xs">Share</button>
                     </div> */}
                </>
            );
        } else {
             // Multiple selection
            return (
                <>
                    <DocumentDuplicateIcon className="w-24 h-24 text-blue-400 opacity-80 mb-4" />
                    <h3 className="font-semibold text-gray-800 mb-1">{count} items selected</h3>
                    {/* Optionally show combined size or type info */}
                    <div className="bg-white border border-gray-200 rounded p-3 text-xs text-gray-600 flex items-start space-x-2 mt-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Properties are not available when multiple items are selected.</span>
                    </div>
                </>
            );
        }
    };

    // --- Render File List Item ---
    // No changes needed here, uses the 'file' object passed in
    const renderFileListItem = (file, index) => {
        const isSelected = selectedFiles.includes(file.name);
        const IconComponent = file.icon;

        // Add onDoubleClick to the outer div of each item type
        const commonProps = {
            key: file.name, // Use name as key (assuming names are unique)
            onClick: (e) => handleFileClick(e, file.name),
            onDoubleClick: () => handleDoubleClick(file), // Add double click handler
        };

        switch (viewMode) {
            case 'list':
                return (
                    <div
                        {...commonProps}
                        className={`flex items-center space-x-2 rounded px-2 py-1 cursor-pointer group border
                                    ${isSelected ? 'bg-blue-100 border-blue-300' : 'border-transparent hover:bg-blue-50 hover:bg-opacity-50'}`}
                    >
                        <IconComponent className={`w-5 h-5 flex-shrink-0 ${file.type === 'File folder' ? 'text-yellow-500' : 'text-gray-500'}`} />
                        <span className={`truncate flex-grow ${isSelected ? 'text-blue-900' : ''}`}>{file.name}</span>
                        <span className={`text-xs w-32 text-right flex-shrink-0 ${isSelected ? 'text-blue-800' : 'text-gray-500'}`}>{file.date}</span>
                    </div>
                );

            case 'medium-icons':
                 return (
                    <div
                        {...commonProps}
                        className={`flex flex-col items-center text-center w-24 p-2 m-1 rounded cursor-pointer border
                                    ${isSelected ? 'bg-blue-100 border-blue-300' : 'border-transparent hover:bg-blue-50 hover:bg-opacity-50'}`}
                    >
                        <IconComponent className={`w-10 h-10 mb-1 ${file.type === 'File folder' ? 'text-yellow-500' : 'text-gray-500'}`} />
                        <span className={`text-xs break-words line-clamp-2 ${isSelected ? 'text-blue-900' : ''}`}>{file.name}</span>
                    </div>
                 );

            case 'details':
            default:
                return (
                    <div
                        {...commonProps}
                        className={`grid grid-cols-[minmax(200px,_3fr)_1fr_1fr_1fr] gap-x-4 items-center rounded px-2 py-1 cursor-pointer group border
                                    ${isSelected ? 'bg-blue-100 border-blue-300' : 'border-transparent hover:bg-blue-50 hover:bg-opacity-50'}`}
                    >
                        <div className="flex items-center space-x-2 truncate">
                            <IconComponent className={`w-5 h-5 flex-shrink-0 ${file.type === 'File folder' ? 'text-yellow-500' : 'text-gray-500'}`} />
                            <span className={`truncate ${isSelected ? 'text-blue-900' : ''}`}>{file.name}</span>
                        </div>
                        <div className={`truncate text-xs ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.date}</div>
                        <div className={`truncate text-xs ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.type}</div>
                        <div className={`text-right pr-2 truncate text-xs ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.size || '—'}</div> {/* Show dash for null size */}
                    </div>
                );
        }
    };

    // --- Render File List Container ---
    // Uses `sortedAndFilteredFiles` which is derived from `fileList`
     const renderFileListContainer = () => {
        const itemsToRender = sortedAndFilteredFiles; // Use the memoized sorted/filtered list

         switch (viewMode) {
             case 'medium-icons':
                 return (
                     <div className="flex flex-wrap p-2 select-none">
                         {itemsToRender.map((file, index) => renderFileListItem(file, index))}
                     </div>
                 );
            case 'list':
            case 'details':
             default:
                 // Determine column definitions based on view mode
                 const columnClass = viewMode === 'details'
                     ? 'grid-cols-[minmax(200px,_3fr)_1fr_1fr_1fr]'
                     : 'grid-cols-[1fr_auto]'; // Name takes remaining space, Date auto width

                 return (
                     <div className="select-none">
                         {/* Sticky Header for Details/List */}
                         {(viewMode === 'details' || viewMode === 'list') && (
                            <div className={`grid ${columnClass} gap-x-4 text-xs text-gray-500 border-b border-gray-200 px-2 pb-1 mb-1 sticky top-0 bg-white z-10 font-medium`}>
                                {/* Add onClick handlers to headers to change sorting */}
                                <div onClick={() => handleSortCriteriaClick('name')} className="text-left font-normal flex items-center hover:bg-gray-100 cursor-pointer py-1 px-1 rounded -ml-1">
                                    Name {sortCriteria === 'name' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)}
                                </div>
                                {viewMode === 'details' && (
                                    <>
                                        <div onClick={() => handleSortCriteriaClick('date')} className="text-left font-normal flex items-center hover:bg-gray-100 cursor-pointer py-1 px-1 rounded">
                                            Date modified {sortCriteria === 'date' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)}
                                        </div>
                                        <div onClick={() => handleSortCriteriaClick('type')} className="text-left font-normal flex items-center hover:bg-gray-100 cursor-pointer py-1 px-1 rounded">
                                            Type {sortCriteria === 'type' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)}
                                        </div>
                                        {/* Size sorting not implemented, header is not clickable */}
                                        <div className="text-right font-normal py-1 px-1 rounded pr-2">Size</div>
                                    </>
                                )}
                                {viewMode === 'list' && (
                                     <div onClick={() => handleSortCriteriaClick('date')} className="text-right font-normal flex items-center justify-end hover:bg-gray-100 cursor-pointer py-1 px-1 rounded">
                                        Date modified {sortCriteria === 'date' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)}
                                     </div>
                                )}
                            </div>
                        )}
                        {/* File List Items */}
                        {itemsToRender.map((file, index) => renderFileListItem(file, index))}
                     </div>
                 );
         }
     };


    return (
        <div className="flex flex-col h-screen bg-white text-gray-800 text-sm font-sans overflow-hidden">

            {/* Address Bar and Navigation */}
            <div className="flex items-center px-2 py-1 border-b border-gray-200 space-x-1 flex-shrink-0">
                 {/* ... (address bar and search bar code remains the same) ... */}
                 <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled><ArrowUturnLeftIcon className="w-5 h-5 text-gray-600" /></button>
                 <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled><ArrowUturnRightIcon className="w-5 h-5 text-gray-600" /></button>
                 <button className="p-1 rounded hover:bg-gray-100"><ChevronDownIcon className="w-4 h-4 text-gray-600" /></button>
                 <button className="p-1 rounded hover:bg-gray-100"><ChevronUpIcon className="w-5 h-5 text-gray-600" /></button>

                 {/* --- Dynamic Breadcrumbs (Placeholder) --- */}
                 {/* This part is hardcoded, ideally it would reflect the actual navigation state */}
                 <div className="flex-grow flex items-center border border-gray-300 rounded bg-white px-2 py-0.5 ml-1">
                     <ComputerDesktopIcon className="w-4 h-4 text-blue-600 mr-2" />
                     <span className="text-gray-500">This PC</span>
                     <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                     <ServerIcon className="w-4 h-4 text-gray-600 mr-2" />
                     <span>New Volume (D:)</span>
                     <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                     <FolderIcon className="w-4 h-4 text-yellow-500 mr-2" />
                     <span className="font-medium">VibeCoding</span> {/* Could make this dynamic later */}
                 </div>
                 {/* --- End Breadcrumbs --- */}

                 <div className="flex items-center border border-gray-300 rounded bg-white px-2 py-0.5 ml-1 flex-grow-[0.5]">
                     <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 mr-2" />
                     <input
                         type="text"
                         placeholder="Search VibeCoding" // Could make this dynamic based on current folder
                         className="outline-none text-sm w-full bg-transparent"
                         value={searchTerm}
                         onChange={handleSearchChange}
                     />
                 </div>
            </div>

             {/* Toolbar */}
            <div className="flex items-center px-3 py-1 border-b border-gray-200 space-x-4 flex-shrink-0">
                 {/* ... (New button, action buttons remain mostly the same) ... */}
                 <button className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-gray-100">
                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                    <span>New</span>
                    <ChevronDownIcon className="w-3 h-3" />
                </button>
                <div className="flex items-center space-x-1 text-gray-600">
                    <button title="Cut" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length === 0}><ScissorsIcon className="w-5 h-5" /></button>
                    <button title="Copy" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length === 0}><DocumentDuplicateIcon className="w-5 h-5" /></button> {/* Changed icon to Copy */}
                    <button title="Paste" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" ><ClipboardIcon className="w-5 h-5" /></button> {/* Paste might be enabled based on clipboard state */}
                    <button title="Rename" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length !== 1}><PencilSquareIcon className="w-5 h-5" /></button>
                    <button title="Share" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length === 0}><ShareIcon className="w-5 h-5" /></button>
                    <button title="Delete" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length === 0}><TrashIcon className="w-5 h-5" /></button>
                </div>
                <div className="border-l border-gray-300 h-5 mx-2"></div>

                {/* --- Sort Button and Dropdown --- */}
                <div className="relative"> {/* Positioning container */}
                    <button
                        ref={sortButtonRef}
                        onClick={() => setIsSortDropdownOpen(prev => !prev)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-gray-100"
                        title={`Sort by ${sortCriteria} (${sortDirection === 'asc' ? 'ascending' : 'descending'})`}
                    >
                        <BarsArrowDownIcon className="w-5 h-5 text-gray-600" />
                        <span>Sort</span>
                        <ChevronDownIcon className="w-3 h-3" />
                    </button>

                    {/* Sort Dropdown Menu */}
                    {isSortDropdownOpen && (
                        <div
                            ref={sortDropdownRef}
                            className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-20 py-1 text-sm"
                        >
                            {/* Sort Criteria */}
                            <button onClick={() => handleSortCriteriaClick('name')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between ${sortCriteria === 'name' ? 'bg-gray-100 font-semibold' : ''}`}>
                                Name {sortCriteria === 'name' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1 text-blue-600"/> : <ArrowDownIcon className="w-3 h-3 ml-1 text-blue-600"/>)}
                            </button>
                            <button onClick={() => handleSortCriteriaClick('date')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between ${sortCriteria === 'date' ? 'bg-gray-100 font-semibold' : ''}`}>
                                Date modified {sortCriteria === 'date' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1 text-blue-600"/> : <ArrowDownIcon className="w-3 h-3 ml-1 text-blue-600"/>)}
                            </button>
                             <button onClick={() => handleSortCriteriaClick('type')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between ${sortCriteria === 'type' ? 'bg-gray-100 font-semibold' : ''}`}>
                                Type {sortCriteria === 'type' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1 text-blue-600"/> : <ArrowDownIcon className="w-3 h-3 ml-1 text-blue-600"/>)}
                            </button>
                            {/* <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span>Size</span> { Size sorting not implemented }
                            </button> */}
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span>More</span> <ChevronRightIcon className="w-3 h-3"/>
                            </button>

                            {/* Sort Direction */}
                             <div className="my-1 border-t border-gray-200"></div>
                             <button onClick={() => handleSortDirectionClick('asc')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortDirection === 'asc' ? 'font-semibold' : ''}`}>
                                {sortDirection === 'asc' ? <CheckIcon className="w-4 h-4 mr-2 text-blue-600"/> : <span className="w-4 mr-2"></span>} Ascending
                            </button>
                             <button onClick={() => handleSortDirectionClick('desc')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortDirection === 'desc' ? 'font-semibold' : ''}`}>
                                {sortDirection === 'desc' ? <CheckIcon className="w-4 h-4 mr-2 text-blue-600"/> : <span className="w-4 mr-2"></span>} Descending
                            </button>

                            {/* Group By (Disabled) */}
                             <div className="my-1 border-t border-gray-200"></div>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span>Group by</span> <ChevronRightIcon className="w-3 h-3"/>
                            </button>
                        </div>
                    )}
                </div>
                {/* --- End Sort Button and Dropdown --- */}


                {/* --- View Button and Dropdown (Existing) --- */}
                <div className="relative">
                    <button
                        ref={viewButtonRef}
                        onClick={() => setIsViewDropdownOpen(prev => !prev)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-gray-100"
                        title={`View: ${viewMode}`}
                    >
                        <EyeIcon className="w-5 h-5 text-gray-600" />
                        <span>View</span>
                        <ChevronDownIcon className="w-3 h-3" />
                    </button>
                    {isViewDropdownOpen && (
                        <div
                            ref={viewDropdownRef}
                            className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-300 rounded shadow-lg z-20 py-1 text-sm"
                        >
                            {/* ... (view dropdown items - updated checkmarks) ... */}
                             <button onClick={() => handleViewOptionClick('extra-large-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> {/* Placeholder for check */}
                                <WindowIcon className="w-4 h-4 text-gray-500"/> <span>Extra large icons</span>
                            </button>
                             <button onClick={() => handleViewOptionClick('large-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                 <span className="w-4 mr-1"></span> {/* Placeholder for check */}
                                <WindowIcon className="w-4 h-4 text-gray-500"/> <span>Large icons</span>
                            </button>
                             <button onClick={() => handleViewOptionClick('medium-icons')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'medium-icons' ? 'font-semibold' : ''}`}>
                                {viewMode === 'medium-icons' ? <CheckIcon className="w-4 h-4 mr-1 text-blue-600"/> : <span className="w-4 mr-1"></span>}
                                <Squares2X2Icon className="w-4 h-4 text-gray-500"/> <span>Medium icons</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('small-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> {/* Placeholder for check */}
                                <Squares2X2Icon className="w-4 h-4 text-gray-500"/> <span>Small icons</span>
                            </button>

                             <div className="my-1 border-t border-gray-200"></div>
                             <button onClick={() => handleViewOptionClick('list')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'list' ? 'font-semibold' : ''}`}>
                                {viewMode === 'list' ? <CheckIcon className="w-4 h-4 mr-1 text-blue-600"/> : <span className="w-4 mr-1"></span>}
                                <QueueListIcon className="w-4 h-4 text-gray-500"/> <span>List</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('details')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'details' ? 'font-semibold' : ''}`}>
                                {viewMode === 'details' ? <CheckIcon className="w-4 h-4 mr-1 text-blue-600"/> : <span className="w-4 mr-1"></span>}
                                <ListBulletIcon className="w-4 h-4 text-gray-500"/> <span>Details</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('tiles')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> {/* Placeholder for check */}
                                <TableCellsIcon className="w-4 h-4 text-gray-500"/> <span>Tiles</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('content')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> {/* Placeholder for check */}
                                <Bars4Icon className="w-4 h-4 text-gray-500"/> <span>Content</span>
                             </button>

                              <div className="my-1 border-t border-gray-200"></div>
                              <button onClick={toggleDetailsPane} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3`}>
                                {showDetailsPane ? <CheckIcon className="w-4 h-4 mr-1 text-blue-600"/> : <span className="w-4 mr-1"></span>}
                                <ViewColumnsIcon className="w-4 h-4 text-gray-500"/> <span>Details pane</span>
                             </button>
                              <button onClick={() => { /* Implement Preview Pane */ setIsViewDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> {/* Placeholder for check */}
                                 <StopIcon className="w-4 h-4 text-gray-500"/> {/* Placeholder */} <span>Preview pane</span>
                             </button>
                        </div>
                    )}
                </div>
                {/* --- End View Button and Dropdown --- */}


                <button className="p-1 rounded hover:bg-gray-100"><EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" /></button>
                <div className="flex-grow"></div>
                {/* Status bar icons could potentially toggle view modes too */}
                {/* <button className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-gray-100">
                    <ListBulletIcon className="w-5 h-5 text-blue-600" />
                    <span>Details</span>
                </button> */}
            </div>


            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* File List Area */}
                <div className="flex-1 flex overflow-hidden">
                    <div
                        ref={fileListRef}
                        className="flex-1 overflow-y-auto relative" // Added relative for potential absolute positioned elements inside
                        onClick={handleBackgroundClick}
                        style={{ WebkitOverflowScrolling: 'touch' }} // Smoother scrolling on touch devices
                    >
                         {renderFileListContainer()}
                         {/* Message when list is empty (even without search) */}
                         { fileList.length === 0 && (
                              <div className="text-center text-gray-500 pt-10 px-4">This folder is empty.</div>
                         )}
                         {/* Message when search yields no results */}
                         {searchTerm && fileList.length > 0 && sortedAndFilteredFiles.length === 0 && (
                             <div className="text-center text-gray-500 pt-10 px-4">No items match your search '{searchTerm}'.</div>
                         )}
                    </div>

                    {/* Details Pane - Conditionally Rendered */}
                    {showDetailsPane && (
                         <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-gray-50 p-4 flex flex-col items-center justify-center text-center overflow-y-auto"> {/* Added overflow-y-auto */}
                             {renderDetailsPane()}
                         </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-0.5 border-t border-gray-200 text-xs text-gray-600 flex-shrink-0">
                <span>{getStatusBarText()}</span>
                {/* Alternative view toggles */}
                <div className="flex space-x-1">
                    <button
                        title="List View"
                        onClick={() => setViewMode('list')}
                        className={`p-0.5 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                    >
                        <Bars3Icon className="w-4 h-4" />
                    </button>
                    <button
                        title="Details View"
                        onClick={() => setViewMode('details')}
                        className={`p-0.5 rounded ${viewMode === 'details' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                    >
                         <ListBulletIcon className="w-4 h-4" />
                    </button>
                     <button
                         title="Medium Icons View"
                         onClick={() => setViewMode('medium-icons')}
                         className={`p-0.5 rounded ${viewMode === 'medium-icons' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                     >
                         <Squares2X2Icon className="w-4 h-4" />
                     </button>
                </div>
            </div>
        </div>
    );
}

Desktop.propTypes = {
  folders: PropTypes.arrayOf(PropTypes.string),
};