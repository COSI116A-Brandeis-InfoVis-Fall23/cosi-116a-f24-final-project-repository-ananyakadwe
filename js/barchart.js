// Immediately Invoked Function Expression to limit access to variables
((() => {
  let selectedStop = "All"; // Default selected stop
      
  const files = [
    {file: "data/Data/cleaned_by_year/Headways_2016_cleaned.csv", year: 2016},
    {file: "data/Data/cleaned_by_year/Headways_2017_cleaned.csv", year: 2017},
    {file: "data/Data/cleaned_by_year/Headways_2018_cleaned.csv", year: 2018},
    {file: "data/Data/cleaned_by_year/Headways_2019_cleaned.csv", year: 2019},
    {file: "data/Data/cleaned_by_year/Headways_2020_cleaned.csv", year: 2020},
    {file: "data/Data/cleaned_by_year/Headways_2021_cleaned.csv", year: 2021},
    {file: "data/Data/cleaned_by_year/Headways_2022_cleaned.csv", year: 2022},
  ];

  let combinedData = [];

  function loadFiles(index){
    if (index >= files.length){
      processAndRender(combinedData);
      return;
    }
    const { file, year } = files[index];

    d3.csv(file, (data) => {
      data.forEach(d => {
        combinedData.push({
          year: year, // add the year from the file info
          stop_name: d.stop_name, // Include stop name
          line: d.line, // Include line for color logic
          headway_time_sec: +d.headway_time_sec, // Convert headway to a number
        });
      });

      // load the next file
      loadFiles(index + 1);
    });
  }

  loadFiles(0);

function processAndRender(data){
  //Aggregate data by year to calculate the average headway
  const uniqueStops = Array.from(new Set(data.map((d) => d.stop_name)))
    .filter(d => d) // Ensure no null/undefined stops
    .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

  const dropdown = d3.select("#stop-dropdown")
    .on("change", function () {
      const selectedStop = this.value;
      const filteredData = data.filter((d) => d.stop_name === selectedStop);
      updateChart(filteredData);
    });
  
  dropdown.selectAll("option")
    .data(uniqueStops) // Ensure no "All"
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);
    
    const defaultStop = uniqueStops[0];
    dropdown.property("value", defaultStop);
  
    // Render the chart with the default stop
    const defaultData = data.filter(d => d.stop_name === defaultStop);
    updateChart(defaultData);
  }

  function updateChart(filteredData) {
    const container = d3.select("#bar-chart-container").node(); 
    const containerWidth = container.getBoundingClientRect().width;
    const width = containerWidth - 100;
    const height = 250;
    const margin = { top: 40, right: 20, bottom: 80, left: 60 };
    
    d3.select("#bar-chart").selectAll("*").remove();
  
    const svg = d3.select("#bar-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
  
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleBand()
      .domain(filteredData.map((d) => d.year))
      .range([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.headway_time_sec)])
      .nice()
      .range([height, 0]);
  
    const colorScale = d3.scaleOrdinal()
      .domain(["orange", "blue", "green", "red"])
      .range(["#FFA500", "#0000FF", "#008000", "#FF0000"]);
  
    // Bars
    chart.selectAll(".bar")
      .data(filteredData)      
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.year))
      .attr("y", d => y(d.headway_time_sec))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.headway_time_sec))
      .attr("fill", d => colorScale(d.line));
  
    // X-axis
    chart.append("g")
      .attr("transform", `translate(0,${height})`) // Ensure it’s at the correct bottom position
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
      
    // Y-axis
    chart.append("g").call(d3.axisLeft(y).ticks(6));
  
    // Chart title
    svg.append("text")
      .attr("x", (width + margin.left) / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Average Headway Time Per Year");
  
    // X-axis label
    svg.append("text")
      .attr("x", (width + margin.left) / 2)
      .attr("y", height + margin.bottom + margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Year");
  
    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", margin.left / 3)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Headway Time (seconds)");
  }

})());