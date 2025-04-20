'use client';

import { useState, MouseEvent, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
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
    const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
    if (!parts) return new Date(0); // Invalid date representation
    return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]);
};


export default function FileExplorerPage() {
    const router = useRouter(); // Initialize router

    const initialFiles = useMemo(() => [
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
    ], []);

    
    const [files] = useState(initialFiles);
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
    const sortedAndFilteredFiles = useMemo(() => {
        // 1. Filter
        let processedFiles = files;
        if (searchTerm) {
            processedFiles = files.filter(file =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sort
        processedFiles.sort((a, b) => {
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

            return sortDirection === 'desc' ? comparison * -1 : comparison;
        });

        return processedFiles;
    }, [files, searchTerm, sortCriteria, sortDirection]); // Re-run if any dependency changes

    
    // --- Click Handlers ---
    const handleFileClick = (event, fileName) => {
        event.stopPropagation();

        // Find index in the *currently displayed* list
        const actualIndexInDisplayedList = sortedAndFilteredFiles.findIndex(f => f.name === fileName);

        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        if (isShiftPressed && lastSelectedIndex !== null) {
            const startFilteredIndex = Math.min(lastSelectedIndex, actualIndexInDisplayedList);
            const endFilteredIndex = Math.max(lastSelectedIndex, actualIndexInDisplayedList);
            const rangeSelection = sortedAndFilteredFiles.slice(startFilteredIndex, endFilteredIndex + 1).map(file => file.name);
            if (isCtrlPressed) {
                setSelectedFiles(prev => [...new Set([...prev, ...rangeSelection])]);
            } else {
                setSelectedFiles(rangeSelection);
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
        setSortCriteria(criteria);
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
            return selectedCount === 1 ? `1 item selected` : `${selectedCount} items selected`;
        }
        const visibleCount = sortedAndFilteredFiles.length; // Use sortedAndFilteredFiles count
        return visibleCount === 1 ? `1 item` : `${visibleCount} items`;
    };

    // --- Render Details Pane ---
    const renderDetailsPane = () => {
        // ... (no changes needed here, uses original file data)
        const count = selectedFiles.length;
        if (count === 0) {
            return (
                <>
                    <FolderIcon className="w-24 h-24 text-yellow-400 opacity-80 mb-4" />
                    <h3 className="font-semibold text-gray-800 mb-1">VibeCoding ({searchTerm ? `${sortedAndFilteredFiles.length} of ${files.length}` : files.length} items)</h3>
                    <div className="bg-white border border-gray-200 rounded p-3 text-xs text-gray-600 flex items-start space-x-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Select a single file to get more information and share your cloud content.</span>
                    </div>
                </>
            );
        } else if (count === 1) {
            const selectedFile = files.find(f => f.name === selectedFiles[0]);
            if (!selectedFile) return null;
            const IconComponent = selectedFile.icon;
            return (
                <>
                    <IconComponent className={`w-24 h-24 mb-4 ${selectedFile.type === 'File folder' ? 'text-yellow-500' : 'text-gray-500'}`} />
                    <h3 className="font-semibold text-gray-800 mb-1 truncate w-full px-2" title={selectedFile.name}>{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{selectedFile.type}</p>
                    <p className="text-xs text-gray-500 mb-1">Date modified: {selectedFile.date}</p>
                    {selectedFile.size && <p className="text-xs text-gray-500">Size: {selectedFile.size}</p>}
                </>
            );
        } else {
            return (
                <>
                    <DocumentDuplicateIcon className="w-24 h-24 text-blue-400 opacity-80 mb-4" />
                    <h3 className="font-semibold text-gray-800 mb-1">{count} items selected</h3>
                    <div className="bg-white border border-gray-200 rounded p-3 text-xs text-gray-600 flex items-start space-x-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Select a single file to get more information and share your cloud content.</span>
                    </div>
                </>
            );
        }
    };

    // --- Render File List Item ---
    const renderFileListItem = (file, index) => {
        const isSelected = selectedFiles.includes(file.name);
        const IconComponent = file.icon;

        // Add onDoubleClick to the outer div of each item type
        const commonProps = {
            key: file.name,
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
                        <div className={`truncate ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.date}</div>
                        <div className={`truncate ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.type}</div>
                        <div className={`text-right pr-2 truncate ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.size || ''}</div>
                    </div>
                );
        }
    };

    // --- Render File List Container ---
     const renderFileListContainer = () => {
        // Use sortedAndFilteredFiles here
        const itemsToRender = sortedAndFilteredFiles;

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
                 return (
                     <div className="select-none">
                         {/* Sticky Header for Details/List */}
                         {(viewMode === 'details' || viewMode === 'list') && (
                            <div className={`grid ${viewMode === 'details' ? 'grid-cols-[minmax(200px,_3fr)_1fr_1fr_1fr]' : 'grid-cols-[1fr_auto]'} gap-x-4 text-xs text-gray-500 border-b border-gray-200 px-2 pb-1 mb-1 sticky top-0 bg-white z-10`}>
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
                                        <div className="text-left font-normal hover:bg-gray-100 cursor-pointer py-1 px-1 rounded">Size</div> {/* Sorting by Size not implemented */}
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

                 <div className="flex-grow flex items-center border border-gray-300 rounded bg-white px-2 py-0.5 ml-1">
                     <ComputerDesktopIcon className="w-4 h-4 text-blue-600 mr-2" />
                     <span className="text-gray-500">This PC</span>
                     <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                     <ServerIcon className="w-4 h-4 text-gray-600 mr-2" />
                     <span>New Volume (D:)</span>
                     <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                     <FolderIcon className="w-4 h-4 text-yellow-500 mr-2" />
                     <span className="font-medium">VibeCoding</span>
                 </div>

                 <div className="flex items-center border border-gray-300 rounded bg-white px-2 py-0.5 ml-1 flex-grow-[0.5]">
                     <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 mr-2" />
                     <input
                         type="text"
                         placeholder="Search VibeCoding"
                         className="outline-none text-sm w-full bg-transparent"
                         value={searchTerm}
                         onChange={handleSearchChange}
                     />
                 </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center px-3 py-1 border-b border-gray-200 space-x-4 flex-shrink-0">
                 {/* ... (New button, action buttons remain the same) ... */}
                 <button className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-gray-100">
                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                    <span>New</span>
                    <ChevronDownIcon className="w-3 h-3" />
                </button>
                <div className="flex items-center space-x-1 text-gray-600">
                    <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled={selectedFiles.length === 0}><ScissorsIcon className="w-5 h-5" /></button>
                    <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled={selectedFiles.length === 0}><DocumentIcon className="w-5 h-5" /></button>
                    <button className="p-1 rounded hover:bg-gray-100"><ClipboardIcon className="w-5 h-5" /></button>
                    <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled={selectedFiles.length !== 1}><PencilSquareIcon className="w-5 h-5" /></button>
                    <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled={selectedFiles.length === 0}><ShareIcon className="w-5 h-5" /></button>
                    <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled={selectedFiles.length === 0}><TrashIcon className="w-5 h-5" /></button>
                </div>
                <div className="border-l border-gray-300 h-5 mx-2"></div>

                {/* --- Sort Button and Dropdown --- */}
                <div className="relative"> {/* Positioning container */}
                    <button
                        ref={sortButtonRef}
                        onClick={() => setIsSortDropdownOpen(prev => !prev)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-gray-100"
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
                            <button onClick={() => handleSortCriteriaClick('name')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortCriteria === 'name' ? 'font-semibold' : ''}`}>
                                {sortCriteria === 'name' ? <span className="text-xs mr-2">•</span> : <span className="w-5"></span>} Name
                            </button>
                            <button onClick={() => handleSortCriteriaClick('date')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortCriteria === 'date' ? 'font-semibold' : ''}`}>
                                {sortCriteria === 'date' ? <span className="text-xs mr-2">•</span> : <span className="w-5"></span>} Date modified
                            </button>
                             <button onClick={() => handleSortCriteriaClick('type')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortCriteria === 'type' ? 'font-semibold' : ''}`}>
                                {sortCriteria === 'type' ? <span className="text-xs mr-2">•</span> : <span className="w-5"></span>} Type
                            </button>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between disabled:opacity-50" disabled>
                                <span className="ml-5">More</span> <ChevronRightIcon className="w-3 h-3"/>
                            </button>

                            {/* Sort Direction */}
                             <div className="my-1 border-t border-gray-200"></div>
                             <button onClick={() => handleSortDirectionClick('asc')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortDirection === 'asc' ? 'font-semibold' : ''}`}>
                                {sortDirection === 'asc' ? <span className="text-xs mr-2">•</span> : <span className="w-5"></span>} Ascending
                            </button>
                             <button onClick={() => handleSortDirectionClick('desc')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortDirection === 'desc' ? 'font-semibold' : ''}`}>
                                {sortDirection === 'desc' ? <span className="text-xs mr-2">•</span> : <span className="w-5"></span>} Descending
                            </button>

                            {/* Group By (Disabled) */}
                             <div className="my-1 border-t border-gray-200"></div>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between disabled:opacity-50" disabled>
                                <span className="ml-5">Group by</span> <ChevronRightIcon className="w-3 h-3"/>
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
                            {/* ... (view dropdown items remain the same) ... */}
                            <button onClick={() => handleViewOptionClick('extra-large-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50" disabled>
                                <WindowIcon className="w-4 h-4 text-gray-500"/> <span>Extra large icons</span>
                            </button>
                             <button onClick={() => handleViewOptionClick('large-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50" disabled>
                                <WindowIcon className="w-4 h-4 text-gray-500"/> <span>Large icons</span>
                            </button>
                             <button onClick={() => handleViewOptionClick('medium-icons')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'medium-icons' ? 'font-semibold' : ''}`}>
                                {viewMode === 'medium-icons' ? <span className="text-xs mr-1">•</span> : <span className="w-4"></span>}
                                <Squares2X2Icon className="w-4 h-4 text-gray-500"/> <span>Medium icons</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('small-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50" disabled>
                                <Squares2X2Icon className="w-4 h-4 text-gray-500"/> <span>Small icons</span>
                            </button>

                             <div className="my-1 border-t border-gray-200"></div>
                             <button onClick={() => handleViewOptionClick('list')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'list' ? 'font-semibold' : ''}`}>
                                {viewMode === 'list' ? <span className="text-xs mr-1">•</span> : <span className="w-4"></span>}
                                <QueueListIcon className="w-4 h-4 text-gray-500"/> <span>List</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('details')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'details' ? 'font-semibold' : ''}`}>
                                {viewMode === 'details' ? <span className="text-xs mr-1">•</span> : <span className="w-4"></span>}
                                <ListBulletIcon className="w-4 h-4 text-gray-500"/> <span>Details</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('tiles')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50" disabled>
                                <TableCellsIcon className="w-4 h-4 text-gray-500"/> <span>Tiles</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('content')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50" disabled>
                                <Bars4Icon className="w-4 h-4 text-gray-500"/> <span>Content</span>
                             </button>

                              <div className="my-1 border-t border-gray-200"></div>
                              <button onClick={toggleDetailsPane} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${showDetailsPane ? 'font-semibold' : ''}`}>
                                {showDetailsPane ? <span className="text-xs mr-1">•</span> : <span className="w-4"></span>}
                                <ViewColumnsIcon className="w-4 h-4 text-gray-500"/> <span>Details pane</span>
                             </button>
                              <button onClick={() => { /* Implement Preview Pane */ setIsViewDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50" disabled>
                                 <StopIcon className="w-4 h-4 text-gray-500"/> {/* Placeholder */} <span>Preview pane</span>
                             </button>
                        </div>
                    )}
                </div>
                {/* --- End View Button and Dropdown --- */}


                <button className="p-1 rounded hover:bg-gray-100"><EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" /></button>
                <div className="flex-grow"></div>
                <button className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-gray-100">
                    <ListBulletIcon className="w-5 h-5 text-blue-600" />
                    <span>Details</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* File List Area */}
                <div className="flex-1 flex overflow-hidden">
                    <div
                        ref={fileListRef}
                        className="flex-1 overflow-y-auto relative"
                        onClick={handleBackgroundClick}
                    >
                         {renderFileListContainer()}
                         {searchTerm && sortedAndFilteredFiles.length === 0 && (
                             <div className="text-center text-gray-500 pt-4">No items match your search.</div>
                         )}
                    </div>

                    {/* Details Pane - Conditionally Rendered */}
                    {showDetailsPane && (
                         <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-gray-50 p-4 flex flex-col items-center justify-center text-center overflow-hidden">
                             {renderDetailsPane()}
                         </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-0.5 border-t border-gray-200 text-xs text-gray-600 flex-shrink-0">
                <span>{getStatusBarText()}</span>
                <div className="flex space-x-1">
                    <Bars3Icon className="w-4 h-4 cursor-pointer hover:bg-gray-100 rounded" />
                    <ViewColumnsIcon className="w-4 h-4 cursor-pointer hover:bg-gray-100 rounded text-blue-600 bg-gray-100" />
                </div>
            </div>
        </div>
    );
}