
// Original dimensions of the map (used for scaling)
const originalMapWidth = 800;
const originalMapHeight = 600;

// Select the SVG container
const svg = d3.select("#mapchart");

// Get dimensions from the container
const container = document.getElementById("mapchart-container");
const svgWidth = container.clientWidth - 80;
const svgHeight = container.clientHeight;

function renderLegend(minHeadway, maxHeadway) {
    const legendWidth = 250;
    const legendHeight = 100;
    const circleSpacing = 80;

    const radiusScale = d3.scaleLinear()
        .domain([minHeadway, maxHeadway])
        .range([5, 20]); // Match the range used for circle sizes in the map

    // Select the legend SVG and set its dimensions
    const legendSvg = d3.select("#legend")
        .attr("width", legendWidth)
        .attr("height", legendHeight);

    // Clear existing elements
    legendSvg.selectAll("*").remove();

    // Add title
    legendSvg.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Circle Size Legend");

    // Append a circle for the minimum value
    legendSvg.append("circle")
        .attr("cx", circleSpacing)
        .attr("cy", legendHeight / 2)
        .attr("r", radiusScale(minHeadway))
        .attr("fill", "gray")
        .attr("opacity", 0.8);

    // Append a circle for the maximum value
    legendSvg.append("circle")
        .attr("cx", circleSpacing * 2)
        .attr("cy", legendHeight / 2)
        .attr("r", radiusScale(maxHeadway))
        .attr("fill", "gray")
        .attr("opacity", 0.8);

    // Add labels for the minimum and maximum values
    legendSvg.append("text")
        .attr("x", circleSpacing)
        .attr("y", legendHeight / 2 + radiusScale(maxHeadway) + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(`${Math.round(minHeadway)} sec`);

    legendSvg.append("text")
        .attr("x", circleSpacing)
        .attr("y", legendHeight / 2 + radiusScale(maxHeadway) + 30) // Slightly lower for "Min Value"
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "gray")
        .text("Min Value");

    legendSvg.append("text")
        .attr("x", circleSpacing * 2)
        .attr("y", legendHeight / 2 + radiusScale(maxHeadway) + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(`${Math.round(maxHeadway)} sec`);

    legendSvg.append("text")
        .attr("x", circleSpacing * 2)
        .attr("y", legendHeight / 2 + radiusScale(maxHeadway) + 30) // Slightly lower for "Max Value"
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "gray")
        .text("Max Value");

    // Add a connecting line between the circles
    legendSvg.append("line")
        .attr("x1", circleSpacing + radiusScale(minHeadway))
        .attr("y1", legendHeight / 2)
        .attr("x2", circleSpacing * 2 - radiusScale(maxHeadway))
        .attr("y2", legendHeight / 2)
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 1);
}

// Set SVG dimensions
svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

// Add the background image
svg.append("image")
    .attr("xlink:href", "../images/map.jpg")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Function to update the visualization based on the selected year
function updateVisualization(data, selectedYear) {
    // Filter data based on the selected year
    const filteredData = data.filter(d => +d.year === selectedYear);

    // Set a scaling factor for the radius based on headway_time_sec values
    const maxHeadway = d3.max(filteredData, d => +d.headway_time_sec);
    const minHeadway = d3.min(filteredData, d => +d.headway_time_sec);
    const radiusScale = d3.scaleLinear()
        .domain([minHeadway, maxHeadway])
        .range([5, 20]); // Can edit the range as needed

    renderLegend(minHeadway, maxHeadway);

    // Clear all "highlighted" classes before updating circles
    svg.selectAll("circle").classed("highlighted", false);

    // Bind data to circles
    const circles = svg.selectAll("circle")
        .data(filteredData);

    // Add new circles
    circles.enter()
        .append("circle")
        .merge(circles) // Update existing circles
        .attr("cx", d => (d.x / originalMapWidth) * svgWidth) // Scale x dynamically with map size
        .attr("cy", d => (d.y / originalMapHeight) * svgHeight) // Scale y dynamically with map size
        .attr("r", d => radiusScale(+d.headway_time_sec))
        .attr("fill", d => {
            if (d.line === 'red') return 'red';
            if (d.line === 'blue') return 'blue';
            if (d.line === 'orange') return 'orange';
            if (d.line === 'green') return 'green';
            return 'gray'; // Shouldn't be any grey dots
        })
        .attr("opacity", 0.8);

    //remove circles not in filtered data
    circles.exit().remove();

    //adds brushing behavior to the map
    const brush = d3.brush()
        .extent([[0, 0], [svgWidth, svgHeight]]) //full extent of the map
        .on("start brush end", () => brushed(data, selectedYear)); //triggers on brush events
    
    svg.select(".brush").remove(); //won't stack multiple brushes

    // Append  brush to the SVG
    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    //Update bar chart initially
    updateBarChart(data, selectedYear);
}

//******** */
// Function to handle brushing (selecting stops)
function brushed(data, selectedYear) {
    if (!d3.event.selection) return; // Exit if nothing is selected

    //Get the bounds of the selection
    const [[x0, y0], [x1, y1]] = d3.event.selection;

    //Find which circles fall within the selection bounds
    const selectedStops = [];

    svg.selectAll("circle").classed("highlighted", function(d) {
        const cx = +d3.select(this).attr("cx");
        const cy = +d3.select(this).attr("cy");

        //Checks if circle is within the bounds
        const isSelected = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;

        if(isSelected){
            selectedStops.push(d.stop_name); // Save the selected stop names
        }
        
        return isSelected; //apply the highlighted class if true
    });

    console.log("Selected Stops from brushing:", selectedStops);

    // Update the bar chart to show only the selected stops
    updateBarChartBySelection(selectedStops, data, selectedYear);
}

// Load the CSV file
d3.csv("data/Data/merged_stop_locations_and_headways.csv", function(error, data) {
    if (error) {
        console.error("Error loading the CSV file:", error);
        return;
    }

    // Ensure numerical data is correctly parsed
    data.forEach(function(d) {
        d.x = +d.x;
        d.y = +d.y;
        d.year = +d.year;
        d.headway_time_sec = +d.headway_time_sec;
    });

    dataset = data; //assign to global var

    console.log("Data Loaded:", dataset); // Verify the data is loaded

    // Add event listener to the slider
    d3.select("#year-slider").on("input", function() {
        selectedYear = +this.value;
        d3.select("#year-label").text(`Year: ${selectedYear}`);
        updateVisualization(dataset, selectedYear);
    });

    // Initial visualization
    updateVisualization(dataset, 2016);
});
