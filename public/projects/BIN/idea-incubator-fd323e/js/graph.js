const IdeaGraph = (() => {
    let svg, simulation, link, node, label;
    let width, height;
    const graphContainer = document.getElementById('graph-container');
    let currentNodes = [];
    let currentLinks = [];
    let selectedNodeId = null;

    function initializeSimulation() {
        simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(100).strength(0.1)) // Adjusted distance and strength
            .force("charge", d3.forceManyBody().strength(-300)) // Increased repulsion
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(d => 25)) // Add collision detection
            .on("tick", ticked);
    }

    function ticked() {
        if (link) {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }

        if (node) {
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        }
    }

    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            // Don't reset fx, fy here if we want positions saved
            // d.fx = null;
            // d.fy = null;

            // Dispatch event to notify script.js about the position change
            const moveEvent = new CustomEvent('ideaMoved', {
                detail: { id: d.id, x: d.x, y: d.y }
            });
            document.dispatchEvent(moveEvent);
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    function handleNodeClick(event, d) {
        event.stopPropagation(); // Prevent triggering background click

        // Toggle selection visually
        const previouslySelected = selectedNodeId;
        selectedNodeId = (selectedNodeId === d.id) ? null : d.id; // Toggle selection

        node.selectAll('circle')
            .attr('stroke', nd => nd.id === selectedNodeId ? 'rgb(79, 70, 229)' : '#aaa') // Indigo-600 for selected
            .attr('stroke-width', nd => nd.id === selectedNodeId ? 3 : 1.5);

        // Dispatch event to notify script.js
        const selectEvent = new CustomEvent('ideaSelected', {
            detail: { id: selectedNodeId } // Send null if deselected
        });
        document.dispatchEvent(selectEvent);
    }

     function handleBackgroundClick() {
        if (selectedNodeId) {
            selectedNodeId = null;
            node.selectAll('circle')
                .attr('stroke', '#aaa')
                .attr('stroke-width', 1.5);

            // Dispatch event to notify script.js about deselection
            const selectEvent = new CustomEvent('ideaSelected', {
                detail: { id: null }
            });
            document.dispatchEvent(selectEvent);
        }
    }

    function updateDimensions() {
        width = graphContainer.clientWidth;
        height = graphContainer.clientHeight;
        if (svg) {
            svg.attr("width", width).attr("height", height);
            simulation.force("center", d3.forceCenter(width / 2, height / 2));
            simulation.alpha(0.3).restart(); // Reheat simulation on resize
        }
    }

    function renderGraph(ideas, linksData) {
        currentNodes = ideas.map(idea => ({ ...idea })); // Create copies to avoid modifying original data directly by simulation
        currentLinks = linksData.map(link => ({ ...link })); // Create copies

        if (!svg) {
            svg = d3.select(graphContainer).append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto; display: block;")
                .on("click", handleBackgroundClick); // Add click listener to SVG background

            svg.append("defs").append("marker") // Optional: Arrowheads for links
                .attr("id", "arrowhead")
                .attr("viewBox", "-0 -5 10 10")
                .attr("refX", 19) // Adjust based on node radius + desired offset
                .attr("refY", 0)
                .attr("orient", "auto")
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("xoverflow", "visible")
                .append("svg:path")
                .attr("d", "M 0,-5 L 10 ,0 L 0,5")
                .attr("fill", "#999")
                .style("stroke", "none");

            link = svg.append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .selectAll("line");

            node = svg.append("g")
                .selectAll("g"); // Use 'g' to group circle and text

            initializeSimulation();
        }

        // --- Link Update ---
        link = link.data(currentLinks, d => `${d.source}-${d.target}`); // Use combined ID for key
        link.exit().remove();
        link = link.enter().append("line")
             // .attr("marker-end", "url(#arrowhead)") // Uncomment if arrows are desired
             .attr("stroke-width", d => Math.sqrt(d.value || 1)) // Example: thicker lines for more connections
             .merge(link);


        // --- Node Update ---
        node = node.data(currentNodes, d => d.id);
        node.exit().remove();

        const nodeEnter = node.enter().append("g")
            .call(drag(simulation))
            .on("click", handleNodeClick);

        nodeEnter.append("circle")
            .attr("r", 12) // Node radius
            .attr("fill", "#ddd") // Node color (can be dynamic based on tags later)
            .attr("stroke", "#aaa")
            .attr("stroke-width", 1.5);

        nodeEnter.append("text")
            .attr("dy", "0.35em") // Vertical centering
            .attr("x", 16) // Offset from circle center
            .attr("font-size", "10px")
            .attr("fill", "#333")
            .attr("paint-order", "stroke") // Make text more readable over lines
            .attr("stroke", "#fff")
            .attr("stroke-width", "3px")
            .attr("stroke-linejoin", "round")
            .text(d => d.title.length > 15 ? d.title.substring(0, 12) + '...' : d.title); // Truncate long titles

        node = nodeEnter.merge(node);

        // Update node selection visuals if needed (e.g., after filtering)
        node.selectAll('circle')
             .attr('stroke', nd => nd.id === selectedNodeId ? 'rgb(79, 70, 229)' : '#aaa')
             .attr('stroke-width', nd => nd.id === selectedNodeId ? 3 : 1.5);


        // --- Simulation Update ---
        simulation.nodes(currentNodes);
        simulation.force("link").links(currentLinks);
        simulation.alpha(1).restart(); // Restart simulation with new data
    }

    // Initial setup and resize handling
    updateDimensions(); // Set initial dimensions
    window.addEventListener('resize', updateDimensions);

    // Expose public methods
    return {
        renderGraph
    };
})();