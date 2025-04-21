'use client';

import { useState, MouseEvent, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    FolderIcon, ComputerDesktopIcon, ServerIcon, ChevronRightIcon, ChevronDownIcon,
    ChevronUpIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, MagnifyingGlassIcon,
    ViewColumnsIcon, Bars3Icon, EllipsisHorizontalIcon, InformationCircleIcon, SparklesIcon,
    ScissorsIcon, DocumentIcon, ClipboardIcon, PencilSquareIcon, ShareIcon, TrashIcon,
    BarsArrowDownIcon, EyeIcon, ListBulletIcon, TagIcon, DocumentDuplicateIcon,
    Squares2X2Icon, QueueListIcon, WindowIcon, TableCellsIcon, Bars4Icon, CheckIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { StopIcon } from '@heroicons/react/20/solid';

const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (fileName.toLowerCase() === '.env') return TagIcon;
    // Add more specific icons based on extension if needed
    // e.g., if (['jpg', 'png', 'gif'].includes(extension)) return PhotoIcon;
    return DocumentIcon;
};

const getFileType = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
     if (fileName.toLowerCase() === '.env') return 'Environment File';
    if (extension) {
        return `${extension.toUpperCase()} File`;
    }
    return 'File';
};

const parseDate = (dateString) => {
    if (!/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(dateString)) {
       return new Date(0);
    }
    const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
    if (!parts) return new Date(0);
    // Assuming date is DD-MM-YYYY HH:MM
    return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]);
};

const defaultFileItems = []; // Keep empty or add fallback defaults if needed

export default function Desktop({
    folders = null,
    files = null,
    currentPath,
    navigateTo,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    isLoading = false,
    error = null,
}) {

     const fileList = useMemo(() => {
        let generatedItems = [];
        let propsProvided = false;

        if (Array.isArray(folders) && folders.length > 0 && folders.every(f => typeof f === 'string')) {
            propsProvided = true;
            const propFolders = folders.map(folderName => ({
                name: folderName,
                date: '18-04-2025 21:01', // Placeholder date
                type: 'File folder',
                size: null,
                icon: FolderIcon
            }));
            generatedItems.push(...propFolders);
        } else if (folders !== null && (!Array.isArray(folders) || !folders.every(f => typeof f === 'string'))) {
            // console.warn("Desktop component received invalid 'folders' prop. Expected array of strings.");
        }

        if (Array.isArray(files) && files.length > 0 && files.every(f => typeof f === 'string')) {
            propsProvided = true;
            const propFiles = files.map(fileName => ({
                name: fileName,
                date: '07-01-2025 19:49', // Placeholder date
                size: null, // Placeholder size
                type: getFileType(fileName),
                icon: getFileIcon(fileName),
            }));
            generatedItems.push(...propFiles);
        } else if (files !== null && (!Array.isArray(files) || !files.every(f => typeof f === 'string'))) {
             // console.warn("Desktop component received invalid 'files' prop. Expected array of strings.");
        }

        if (propsProvided) {
            return generatedItems;
        } else if (folders === null && files === null) {
             return defaultFileItems;
        } else {
            return generatedItems;
        }
    }, [folders, files]);


    const [selectedFiles, setSelectedFiles] = useState([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fileListRef = useRef(null);
    const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
    const [viewMode, setViewMode] = useState('details'); // Default view
    const [showDetailsPane, setShowDetailsPane] = useState(true); // Default to show on larger screens
    const viewDropdownRef = useRef(null);
    const viewButtonRef = useRef(null);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [sortCriteria, setSortCriteria] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const sortDropdownRef = useRef(null);
    const sortButtonRef = useRef(null);

    // --- Responsive adjustments hook ---
    useEffect(() => {
        const checkScreenSize = () => {
            // Hide details pane on small screens by default
            if (window.innerWidth < 768) { // md breakpoint
                setShowDetailsPane(false);
                 // Optionally force a mobile-friendly view mode
                 if (viewMode === 'details') {
                    setViewMode('list');
                 }
            } else {
                setShowDetailsPane(true); // Show on larger screens
            }
        };
        checkScreenSize(); // Initial check
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [viewMode]); // Rerun if viewMode changes, though primary trigger is resize


    useEffect(() => {
        setSelectedFiles([]);
        setLastSelectedIndex(null);
    }, [currentPath]);

    const sortedAndFilteredFiles = useMemo(() => {
         let processedFiles = fileList;
        if (searchTerm) {
            processedFiles = fileList.filter(file =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        const filesToSort = [...processedFiles];
        filesToSort.sort((a, b) => {
             let compareA, compareB;
             switch (sortCriteria) {
                 case 'date': compareA = parseDate(a.date); compareB = parseDate(b.date); break;
                 case 'type': compareA = a.type.toLowerCase(); compareB = b.type.toLowerCase(); break;
                 default: /*name*/ compareA = a.name.toLowerCase(); compareB = b.name.toLowerCase(); break;
             }
             let comparison = 0;
             if (compareA > compareB) comparison = 1;
             else if (compareA < compareB) comparison = -1;
             // Handle invalid dates if sorting by date
             if (sortCriteria === 'date' && compareA.getTime() === 0 && compareB.getTime() !== 0) return 1; // Invalid dates last
             if (sortCriteria === 'date' && compareA.getTime() !== 0 && compareB.getTime() === 0) return -1; // Invalid dates last
             return sortDirection === 'desc' ? comparison * -1 : comparison;
         });
         return filesToSort;
    }, [fileList, searchTerm, sortCriteria, sortDirection]);


     const handleFileClick = (event, fileName) => {
        event.stopPropagation();
        const actualIndexInDisplayedList = sortedAndFilteredFiles.findIndex(f => f.name === fileName);
        if (actualIndexInDisplayedList === -1) return;

        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        if (isShiftPressed && lastSelectedIndex !== null && lastSelectedIndex < sortedAndFilteredFiles.length) {
             const startFilteredIndex = Math.min(lastSelectedIndex, actualIndexInDisplayedList);
             const endFilteredIndex = Math.max(lastSelectedIndex, actualIndexInDisplayedList);
             if (startFilteredIndex >= 0 && endFilteredIndex < sortedAndFilteredFiles.length) {
                const rangeSelection = sortedAndFilteredFiles.slice(startFilteredIndex, endFilteredIndex + 1).map(file => file.name);
                if (isCtrlPressed) {
                    setSelectedFiles(prev => [...new Set([...prev, ...rangeSelection])]);
                } else {
                    setSelectedFiles(rangeSelection);
                }
             } else {
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

    const handleDoubleClick = (file) => {
        if (file.type === 'File folder') {
            const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
            navigateTo(newPath);
        } else {
            // Assuming files are served relative to a 'projects' base path
            // Adjust this logic based on your actual file serving setup
            const filePath = `/projects${currentPath === '/' ? '' : currentPath}/${file.name}`;
            console.log("Opening file:", filePath);
            try {
                window.open(filePath, '_blank'); // Open in new tab
            } catch (e) {
                console.error("Failed to open file:", e);
                // Optionally show an error message to the user
            }
        }
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
        if (criteria === sortCriteria) {
             setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCriteria(criteria);
            setSortDirection('asc');
        }
        setIsSortDropdownOpen(false);
    };

    const handleSortDirectionClick = (direction) => {
        setSortDirection(direction);
        setIsSortDropdownOpen(false);
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
             if (isViewDropdownOpen && viewDropdownRef.current && !viewDropdownRef.current.contains(event.target) && viewButtonRef.current && !viewButtonRef.current.contains(event.target)) {
                 setIsViewDropdownOpen(false);
             }
             if (isSortDropdownOpen && sortDropdownRef.current && !sortDropdownRef.current.contains(event.target) && sortButtonRef.current && !sortButtonRef.current.contains(event.target)) {
                 setIsSortDropdownOpen(false);
             }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isViewDropdownOpen, isSortDropdownOpen]);


     const getStatusBarText = () => {
        const selectedCount = selectedFiles.length;
        if (selectedCount > 0) {
             return selectedCount === 1 ? `1 item selected` : `${selectedCount} items selected`;
        }
        const visibleCount = sortedAndFilteredFiles.length;
        const totalCount = fileList.length;
         if (isLoading) return "Loading items...";
         if (error) return "Error loading items";

        if (searchTerm && visibleCount !== totalCount) {
             return `${visibleCount} item${visibleCount !== 1 ? 's' : ''} found (${totalCount} total)`;
        } else {
             return totalCount === 1 ? `1 item` : `${totalCount} items`;
        }
    };

    const renderDetailsPane = () => {
        const count = selectedFiles.length;
        const folderName = currentPath.split('/').pop() || 'Projects';

        if (count === 0) {
             const totalItemCount = fileList.length;
             const visibleItemCount = sortedAndFilteredFiles.length;
             const countText = searchTerm && visibleItemCount !== totalItemCount ? `${visibleItemCount} of ${totalItemCount}` : totalItemCount;

             return (
                <>
                    <FolderIcon className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-400 opacity-80 mb-2 sm:mb-4" />
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base break-words w-full px-1">{folderName} ({isLoading ? '...' : countText} items)</h3>
                     {isLoading && <ArrowPathIcon className="w-5 h-5 text-gray-500 animate-spin my-2" />}
                     {error && <p className="text-xs text-red-600 bg-red-100 border border-red-300 rounded p-2 my-2 w-full">{error}</p>}
                    {!isLoading && !error && (
                        <div className="bg-white border border-gray-200 rounded p-2 sm:p-3 text-xs text-gray-600 flex items-start space-x-2 mt-2 w-full">
                            <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>Select an item to see details.</span>
                        </div>
                    )}
                </>
            );
        } else if (count === 1) {
             const selectedFile = fileList.find(f => f.name === selectedFiles[0]);
            if (!selectedFile) return null;
            const IconComponent = selectedFile.icon;
            return (
                <>
                    <IconComponent className={`w-16 h-16 sm:w-24 sm:h-24 mb-2 sm:mb-4 ${selectedFile.type === 'File folder' ? 'text-yellow-500' : 'text-gray-500'}`} />
                    <h3 className="font-semibold text-gray-800 mb-1 break-words w-full px-2 text-sm sm:text-base" title={selectedFile.name}>{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{selectedFile.type}</p>
                    <p className="text-xs text-gray-500 mb-1">Date modified: {selectedFile.date}</p>
                    {selectedFile.size && <p className="text-xs text-gray-500">Size: {selectedFile.size}</p>}
                </>
            );
        } else {
             return (
                <>
                    <DocumentDuplicateIcon className="w-16 h-16 sm:w-24 sm:h-24 text-blue-400 opacity-80 mb-2 sm:mb-4" />
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{count} items selected</h3>
                    <div className="bg-white border border-gray-200 rounded p-2 sm:p-3 text-xs text-gray-600 flex items-start space-x-2 mt-2 w-full">
                        <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Properties are not available when multiple items are selected.</span>
                    </div>
                </>
            );
        }
    };


     const renderFileListItem = (file, index) => {
        const isSelected = selectedFiles.includes(file.name);
        const IconComponent = file.icon;
        const commonProps = {
            key: file.name,
            onClick: (e) => handleFileClick(e, file.name),
            onDoubleClick: () => handleDoubleClick(file),
            className: `border rounded cursor-pointer ${isSelected ? 'bg-blue-100 border-blue-300' : 'border-transparent hover:bg-blue-50 hover:bg-opacity-50'}`
        };
        const iconColor = file.type === 'File folder' ? 'text-yellow-500' : 'text-gray-500';

        switch (viewMode) {
             case 'list':
                 return (
                    <div {...commonProps} className={`${commonProps.className} flex items-center space-x-2 px-2 py-1.5 group`}>
                        <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${iconColor}`} />
                        <span className={`truncate flex-grow text-xs sm:text-sm ${isSelected ? 'text-blue-900' : ''}`}>{file.name}</span>
                        <span className={`text-xs w-28 sm:w-32 text-right flex-shrink-0 ${isSelected ? 'text-blue-800' : 'text-gray-500'}`}>{file.date}</span>
                    </div> );
             case 'medium-icons':
                 return (
                    <div {...commonProps} className={`${commonProps.className} flex flex-col items-center text-center w-20 sm:w-24 p-1 m-0.5 sm:p-2 sm:m-1`}>
                        <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 mb-1 ${iconColor}`} />
                        <span className={`text-[10px] sm:text-xs break-words line-clamp-2 ${isSelected ? 'text-blue-900' : ''}`}>{file.name}</span>
                    </div> );
             case 'details':
             default:
                 return (
                     <div {...commonProps} className={`${commonProps.className} grid grid-cols-[minmax(100px,_2fr)_minmax(80px,_1fr)] md:grid-cols-[minmax(150px,_3fr)_1fr_1fr_1fr] gap-x-2 sm:gap-x-4 items-center px-2 py-1.5 group`}>
                         {/* Name Column (Always Visible) */}
                         <div className="flex items-center space-x-1 sm:space-x-2 truncate">
                            <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${iconColor}`} />
                            <span className={`truncate text-xs sm:text-sm ${isSelected ? 'text-blue-900' : ''}`}>{file.name}</span>
                         </div>
                         {/* Date Modified Column (Always Visible, maybe smaller on mobile) */}
                         <div className={`truncate text-[10px] sm:text-xs text-right md:text-left ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.date}</div>
                         {/* Type Column (Hidden on mobile, visible md+) */}
                         <div className={`hidden md:block truncate text-xs ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.type}</div>
                         {/* Size Column (Hidden on mobile, visible md+) */}
                         <div className={`hidden md:block text-right pr-2 truncate text-xs ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{file.size || '—'}</div>
                     </div> );
        }
    };


     const renderFileListContainer = () => {
        const itemsToRender = sortedAndFilteredFiles;

        if (isLoading) {
             return (
                 <div className="flex justify-center items-center h-full text-gray-500 text-sm p-4">
                     <ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
                     Loading...
                 </div>
             );
         }

         if (error) {
             return (
                 <div className="flex flex-col justify-center items-center h-full text-red-600 px-4 text-center">
                      <ExclamationCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                      <p className="font-medium text-sm sm:text-base">Error Loading Folder</p>
                      <p className="text-xs sm:text-sm">{error}</p>
                 </div>
             );
         }

          if (itemsToRender.length === 0) {
             if (searchTerm) {
                 return <div className="text-center text-gray-500 pt-8 sm:pt-10 px-4 text-sm">No items match your search '{searchTerm}'.</div>;
             } else {
                 return <div className="text-center text-gray-500 pt-8 sm:pt-10 px-4 text-sm">This folder is empty.</div>;
             }
         }


         switch (viewMode) {
             case 'medium-icons':
                 return ( <div className="flex flex-wrap p-1 sm:p-2 select-none"> {itemsToRender.map((file, index) => renderFileListItem(file, index))} </div> );
            case 'list':
                 const listColumnClass = 'grid-cols-[1fr_auto]';
                 return (
                     <div className="select-none">
                        <div className={`grid ${listColumnClass} gap-x-2 sm:gap-x-4 text-xs text-gray-500 border-b border-gray-200 px-2 pb-1 mb-1 sticky top-0 bg-white z-10 font-medium`}>
                            <div onClick={() => handleSortCriteriaClick('name')} className="text-left font-normal flex items-center hover:bg-gray-100 cursor-pointer py-1 px-1 rounded -ml-1"> Name {sortCriteria === 'name' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)} </div>
                            <div onClick={() => handleSortCriteriaClick('date')} className="text-right font-normal flex items-center justify-end hover:bg-gray-100 cursor-pointer py-1 px-1 rounded w-28 sm:w-32"> Date modified {sortCriteria === 'date' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)} </div>
                        </div>
                        {itemsToRender.map((file, index) => renderFileListItem(file, index))}
                     </div>
                 );
            case 'details':
             default:
                 const detailsColumnClass = 'grid-cols-[minmax(100px,_2fr)_minmax(80px,_1fr)] md:grid-cols-[minmax(150px,_3fr)_1fr_1fr_1fr]';
                 return (
                     <div className="select-none">
                         <div className={`grid ${detailsColumnClass} gap-x-2 sm:gap-x-4 text-[10px] sm:text-xs text-gray-500 border-b border-gray-200 px-2 pb-1 mb-1 sticky top-0 bg-white z-10 font-medium`}>
                             <div onClick={() => handleSortCriteriaClick('name')} className="text-left font-normal flex items-center hover:bg-gray-100 cursor-pointer py-1 px-1 rounded -ml-1"> Name {sortCriteria === 'name' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)} </div>
                             <div onClick={() => handleSortCriteriaClick('date')} className="text-right md:text-left font-normal flex items-center hover:bg-gray-100 cursor-pointer py-1 px-1 rounded justify-end md:justify-start"> Date modified {sortCriteria === 'date' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)} </div>
                             <div onClick={() => handleSortCriteriaClick('type')} className="hidden md:flex text-left font-normal items-center hover:bg-gray-100 cursor-pointer py-1 px-1 rounded"> Type {sortCriteria === 'type' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1"/> : <ArrowDownIcon className="w-3 h-3 ml-1"/>)} </div>
                             <div className="hidden md:block text-right font-normal py-1 px-1 rounded pr-2">Size</div>
                         </div>
                        {itemsToRender.map((file, index) => renderFileListItem(file, index))}
                     </div>
                 );
         }
     };

    const renderBreadcrumbs = () => {
        const segments = currentPath.split('/').filter(Boolean);
        const breadcrumbs = [];

        breadcrumbs.push(
             <div key="root" className="flex items-center flex-shrink-0">
                <FolderIcon className="w-4 h-4 text-yellow-500 mr-1 flex-shrink-0" />
                {segments.length > 0 ? (
                    <button onClick={() => navigateTo('/')} className="hover:underline text-xs sm:text-sm">Projects</button>
                ) : (
                    <span className="font-medium text-xs sm:text-sm">Projects</span>
                )}
            </div>
        );

        let currentBuiltPath = '';
        segments.forEach((segment, index) => {
            currentBuiltPath += `/${segment}`;
            const isLast = index === segments.length - 1;
            const pathForLink = currentBuiltPath;

            breadcrumbs.push(
                <ChevronRightIcon key={`sep-${index}`} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-0.5 sm:mx-1 flex-shrink-0" />
            );

            breadcrumbs.push(
                // Add min-w-0 and truncate to prevent long names breaking layout
                <div key={pathForLink} className="flex items-center flex-shrink min-w-0">
                    <FolderIcon className="w-4 h-4 text-yellow-500 mr-1 flex-shrink-0" />
                    {isLast ? (
                        <span className="font-medium text-xs sm:text-sm truncate">{segment}</span>
                    ) : (
                         <button onClick={() => navigateTo(pathForLink)} className="hover:underline text-xs sm:text-sm truncate">{segment}</button>
                    )}
                </div>
            );
        });

        return (
             // Allow breadcrumbs to shrink and hide overflow
             <div className="flex-1 flex items-center border border-gray-300 rounded bg-white px-1.5 sm:px-2 py-0.5 ml-1 min-w-0 overflow-hidden">
                <ComputerDesktopIcon className="w-4 h-4 text-blue-600 mr-1 sm:mr-2 flex-shrink-0" />
                 <div className="flex items-center space-x-0.5 sm:space-x-1 overflow-hidden whitespace-nowrap">
                    {breadcrumbs}
                </div>
            </div>
        );
    };


    return (
        <div className="flex flex-col h-screen bg-white text-gray-800 font-sans overflow-hidden">

            {/* Top Bar: Address Bar, Navigation, Search */}
            <div className="flex flex-wrap sm:flex-nowrap items-center px-1 sm:px-2 py-1 border-b border-gray-200 gap-1 sm:space-x-1 flex-shrink-0">
                 {/* Navigation Buttons */}
                 <div className="flex items-center flex-shrink-0 space-x-0.5">
                    <button
                        onClick={goBack}
                        disabled={!canGoBack || isLoading}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Back"
                    >
                        <ArrowUturnLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={goForward}
                        disabled={!canGoForward || isLoading}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Forward"
                    >
                        <ArrowUturnRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    {/* Keep other buttons if needed, ensure they are responsive */}
                    {/* <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled={isLoading}><ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" /></button> */}
                    {/* <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled={isLoading}><ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /></button> */}
                 </div>

                 {/* Dynamic Breadcrumbs - Takes available space */}
                 {renderBreadcrumbs()}

                 {/* Search Bar - Takes remaining space on sm+, full width on xs if wraps */}
                 <div className="w-full sm:w-auto flex items-center border border-gray-300 rounded bg-white px-1.5 sm:px-2 py-0.5 sm:ml-1 flex-grow sm:flex-grow-0 sm:max-w-xs">
                     <MagnifyingGlassIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1 sm:mr-2" />
                     <input
                         type="text"
                         placeholder={`Search ${currentPath.split('/').pop() || 'Projects'}`}
                         className="outline-none text-xs sm:text-sm w-full bg-transparent"
                         value={searchTerm}
                         onChange={handleSearchChange}
                         disabled={isLoading}
                     />
                 </div>
            </div>

             {/* Toolbar - Simplified on mobile */}
            <div className="flex items-center px-2 sm:px-3 py-1 border-b border-gray-200 space-x-2 sm:space-x-4 flex-shrink-0 flex-wrap">
                  <button className="flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm" disabled={isLoading}>
                    <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="hidden sm:inline">New</span>
                    <ChevronDownIcon className="w-3 h-3" />
                </button>
                {/* Action Buttons - Icons only on mobile */}
                <div className="flex items-center space-x-0.5 sm:space-x-1 text-gray-600">
                    <button title="Cut" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length === 0 || isLoading}><ScissorsIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    <button title="Copy" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length === 0 || isLoading}><DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    <button title="Paste" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}><ClipboardIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    <button title="Rename" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length !== 1 || isLoading}><PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    <button title="Share" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length === 0 || isLoading}><ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    <button title="Delete" className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedFiles.length === 0 || isLoading}><TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                </div>
                <div className="hidden sm:block border-l border-gray-300 h-5 mx-2"></div> {/* Separator for larger screens */}

                {/* Sort Button - Icons only on mobile */}
                 <div className="relative">
                    <button
                        ref={sortButtonRef}
                        onClick={() => setIsSortDropdownOpen(prev => !prev)}
                        className="flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
                        title={`Sort by ${sortCriteria} (${sortDirection === 'asc' ? 'ascending' : 'descending'})`}
                        disabled={isLoading}
                    >
                        <BarsArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        <span className="hidden sm:inline">Sort</span>
                        <ChevronDownIcon className="w-3 h-3" />
                    </button>
                    {isSortDropdownOpen && (
                        <div
                            ref={sortDropdownRef}
                            className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-20 py-1 text-xs sm:text-sm"
                        >
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
                                <span>More</span> <ChevronRightIcon className="w-3 h-3"/>
                            </button> */}
                             <div className="my-1 border-t border-gray-200"></div>
                             <button onClick={() => handleSortDirectionClick('asc')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortDirection === 'asc' ? 'font-semibold' : ''}`}>
                                {sortDirection === 'asc' ? <CheckIcon className="w-4 h-4 mr-2 text-blue-600"/> : <span className="w-4 mr-2"></span>} Ascending
                            </button>
                             <button onClick={() => handleSortDirectionClick('desc')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center ${sortDirection === 'desc' ? 'font-semibold' : ''}`}>
                                {sortDirection === 'desc' ? <CheckIcon className="w-4 h-4 mr-2 text-blue-600"/> : <span className="w-4 mr-2"></span>} Descending
                            </button>
                             {/* <div className="my-1 border-t border-gray-200"></div>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span>Group by</span> <ChevronRightIcon className="w-3 h-3"/>
                            </button> */}
                        </div>
                    )}
                </div>
                {/* View Button - Icons only on mobile */}
                 <div className="relative">
                    <button
                        ref={viewButtonRef}
                        onClick={() => setIsViewDropdownOpen(prev => !prev)}
                        className="flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
                        title={`View: ${viewMode}`}
                        disabled={isLoading}
                    >
                        <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        <span className="hidden sm:inline">View</span>
                        <ChevronDownIcon className="w-3 h-3" />
                    </button>
                    {isViewDropdownOpen && (
                        <div
                            ref={viewDropdownRef}
                            className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 w-52 sm:w-56 bg-white border border-gray-300 rounded shadow-lg z-20 py-1 text-xs sm:text-sm"
                        >
                             {/* <button onClick={() => handleViewOptionClick('extra-large-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> <WindowIcon className="w-4 h-4 text-gray-500"/> <span>Extra large icons</span>
                            </button>
                             <button onClick={() => handleViewOptionClick('large-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                 <span className="w-4 mr-1"></span> <WindowIcon className="w-4 h-4 text-gray-500"/> <span>Large icons</span>
                            </button> */}
                             <button onClick={() => handleViewOptionClick('medium-icons')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'medium-icons' ? 'font-semibold' : ''}`}>
                                {viewMode === 'medium-icons' ? <CheckIcon className="w-4 h-4 mr-1 text-blue-600"/> : <span className="w-4 mr-1"></span>}
                                <Squares2X2Icon className="w-4 h-4 text-gray-500"/> <span>Medium icons</span>
                             </button>
                             {/* <button onClick={() => handleViewOptionClick('small-icons')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> <Squares2X2Icon className="w-4 h-4 text-gray-500"/> <span>Small icons</span>
                            </button> */}
                             <div className="my-1 border-t border-gray-200"></div>
                             <button onClick={() => handleViewOptionClick('list')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'list' ? 'font-semibold' : ''}`}>
                                {viewMode === 'list' ? <CheckIcon className="w-4 h-4 mr-1 text-blue-600"/> : <span className="w-4 mr-1"></span>}
                                <QueueListIcon className="w-4 h-4 text-gray-500"/> <span>List</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('details')} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 ${viewMode === 'details' ? 'font-semibold' : ''}`}>
                                {viewMode === 'details' ? <CheckIcon className="w-4 h-4 mr-1 text-blue-600"/> : <span className="w-4 mr-1"></span>}
                                <ListBulletIcon className="w-4 h-4 text-gray-500"/> <span>Details</span>
                             </button>
                             {/* <button onClick={() => handleViewOptionClick('tiles')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> <TableCellsIcon className="w-4 h-4 text-gray-500"/> <span>Tiles</span>
                             </button>
                             <button onClick={() => handleViewOptionClick('content')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> <Bars4Icon className="w-4 h-4 text-gray-500"/> <span>Content</span>
                             </button> */}
                              <div className="my-1 border-t border-gray-200"></div>
                              <button onClick={toggleDetailsPane} className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3`}>
                                {showDetailsPane ? <CheckIcon className="w-4 h-4 mr-1 text-blue-600"/> : <span className="w-4 mr-1"></span>}
                                <ViewColumnsIcon className="w-4 h-4 text-gray-500"/> <span>Details pane</span>
                             </button>
                              {/* <button onClick={() => { setIsViewDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <span className="w-4 mr-1"></span> <StopIcon className="w-4 h-4 text-gray-500"/>
                                <span>Preview pane</span>
                             </button> */}
                        </div>
                    )}
                </div>
                 {/* <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 hidden sm:block" disabled={isLoading}><EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" /></button> */}
                <div className="flex-grow hidden sm:block"></div> {/* Spacer */}
            </div>

            {/* Main Content Area - Adapts layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* File List Area - Always takes full width on mobile */}
                <div
                    ref={fileListRef}
                    className="flex-1 overflow-y-auto relative"
                    onClick={handleBackgroundClick}
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                     {renderFileListContainer()}
                </div>

                {/* Details Pane - Hidden on mobile (md:flex), shown on md+ */}
                {showDetailsPane && (
                     <div className="w-64 md:w-72 flex-shrink-0 border-l border-gray-200 bg-gray-50 p-3 sm:p-4 flex flex-col items-center justify-start text-center overflow-y-auto">
                         {/* Added justify-start to align content top */}
                         {renderDetailsPane()}
                     </div>
                )}
            </div>

            {/* Status Bar - Adapts layout */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-1 sm:py-0.5 border-t border-gray-200 text-[10px] sm:text-xs text-gray-600 flex-shrink-0 gap-1 sm:gap-0">
                <span className="text-center sm:text-left">{getStatusBarText()}</span>
                 {/* Status Bar View Toggles */}
                 <div className="flex space-x-1">
                    <button title="List View" onClick={() => setViewMode('list')} disabled={isLoading} className={`p-0.5 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 disabled:opacity-50'}`}> <Bars3Icon className="w-3 h-3 sm:w-4 sm:h-4" /> </button>
                    <button title="Details View" onClick={() => setViewMode('details')} disabled={isLoading} className={`p-0.5 rounded ${viewMode === 'details' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 disabled:opacity-50'}`}> <ListBulletIcon className="w-3 h-3 sm:w-4 sm:h-4" /> </button>
                    <button title="Medium Icons View" onClick={() => setViewMode('medium-icons')} disabled={isLoading} className={`p-0.5 rounded ${viewMode === 'medium-icons' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 disabled:opacity-50'}`}> <Squares2X2Icon className="w-3 h-3 sm:w-4 sm:h-4" /> </button>
                </div>
            </div>
        </div>
    );
}

Desktop.propTypes = {
  folders: PropTypes.arrayOf(PropTypes.string),
  files: PropTypes.arrayOf(PropTypes.string),
  currentPath: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  goForward: PropTypes.func.isRequired,
  canGoBack: PropTypes.bool.isRequired,
  canGoForward: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};