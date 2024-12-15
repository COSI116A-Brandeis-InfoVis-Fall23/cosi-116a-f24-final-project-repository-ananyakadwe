// Set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
var svgContainer = d3.select("#headway-barchart-container")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Tooltip div (hidden by default)
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("background-color", "lightgrey")
  .style("padding", "5px")
  .style("border-radius", "3px");

// Function to update the bar chart based on the selected year
function updateBarChart(data, selectedYear) {
  // Filter the data based on the selected year
  const filteredData = data.filter(d => +d.year === selectedYear);

  // Sort the filtered data in descending order by headway_time_sec
  filteredData.sort(function(a, b) {
    return b.headway_time_sec - a.headway_time_sec; // Sort in descending order
  });

// Add a title to the chart (clear previous first)
  svgContainer.selectAll(".chart-title").remove();
  svgContainer.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2) // Center horizontally
      .attr("y", -10) // Position above the chart
      .attr("text-anchor", "middle")
      .style("font-size", "17px")
      .style("font-weight", "bold")
      .text("Headway Times by Stop");

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => d.headway_time_sec)]) // Use the max headway time in the filtered data
    .range([0, width]);

  svgContainer.selectAll(".x-axis").remove(); // Remove any existing X axis
  svgContainer.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Add X-axis label
  svgContainer.selectAll(".x-axis-label").remove(); // Remove existing label (if any)
  svgContainer.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2) // Center horizontally
      .attr("y", height + margin.bottom - 10) // Position below the axis
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Headway Time (seconds)");

  // Y axis
  var y = d3.scaleBand()
    .range([0, height])
    .domain(filteredData.map(function(d) { return d.stop_name; })) // Y domain based on sorted data
    .padding(0.1);

  svgContainer.selectAll(".y-axis").remove(); // Remove any existing Y axis
  svgContainer.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

    // Add Y-axis label
  svgContainer.selectAll(".y-axis-label").remove();
  svgContainer.append("text")
      .attr("class", "y-axis-label")
      .attr("x", -height / 2) // Center vertically
      .attr("y", -margin.left + 20) // Position to the left of the axis
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)") // Rotate the label
      .style("font-size", "16px")
      .text("Stop Names");

  // Define a color scale for the "line" column
  var colorScale = d3.scaleOrdinal()
    .domain(["red", "green", "orange", "blue"])
    .range(["red", "green", "orange", "blue"]);

  // Bars
  var bars = svgContainer.selectAll("rect")
    .data(filteredData, function(d) { return d.stop_name; }); // Use stop_name as the key for data join

  // Remove bars that are no longer in the filtered data
  bars.exit().remove();

  // Add new bars or update existing ones
  bars.enter()
    .append("rect")
    .merge(bars) // Update existing bars or add new ones
    .attr("x", x(0))
    .attr("y", function(d) { return y(d.stop_name); })
    .attr("width", function(d) { return x(d.headway_time_sec); })
    .attr("height", y.bandwidth())
    .attr("fill", function(d) { return colorScale(d.line); }) // Use the colorScale based on the "line" column
}

//**** */
// Function to update the bar chart based on selected stops
function updateBarChartBySelection(selectedStops, data, selectedYear) {
  console.log("Selected Stops:", selectedStops); // Log the stops passed from brushing

  // Filter the data to include only selected stops
  const filteredData = data.filter((d) => selectedStops.includes(d.stop_name) && +d.year === selectedYear);
  
  console.log("Filtered Data:", filteredData); // Log the filtered data

  if(selectedStops.length === 0 || filteredData.length === 0){
    updateBarChart(data.filter((d) => +d.year === selectedYear), selectedYear);
    return;
  }

  // Redraw the bar chart with the filtered data
  updateBarChart(filteredData, selectedYear);
}
//**** */

// Load the CSV file
d3.csv("data/Data/merged_stop_locations_and_headways.csv", function(error, data) {
  if (error) {
    console.error("Error loading the CSV file:", error);
    return;
  }

  // Ensure numerical data is correctly parsed
  data.forEach(function(d) {
    d.year = +d.year;
    d.headway_time_sec = +d.headway_time_sec;
  });

  // Initial bar chart visualization for 2016
  updateBarChart(data, 2016);
});