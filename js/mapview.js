// Original dimensions of the map (used for scaling)
const originalMapWidth = 800;
const originalMapHeight = 600;

// Select the SVG container
const svg = d3.select("#chart");

// Get dimensions from the container
const container = document.getElementById("chart-container");
const svgWidth = container.clientWidth;
const svgHeight = container.clientHeight;

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

    // Remove circles not in filtered data
    circles.exit().remove();
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

    // Check the loaded data in the console
    console.log(data);

    // Add event listener to the slider
    d3.select("#year-slider").on("input", function() {
        const selectedYear = +this.value;
        d3.select("#year-label").text(`Year: ${selectedYear}`);
        updateVisualization(data, selectedYear);
    });

    // Initial visualization
    updateVisualization(data, 2016);
});
