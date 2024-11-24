// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {
  const fakeData = [
    {letter: "A", frequency: 0.1},
    {letter: "B", frequency: 0.2},
    {letter: "C", frequency: 0.3},
    {letter: "D", frequency: 0.4},
    {letter: "E", frequency: 0.5},
  ];

  function chart(data){
    const width = 928;
    const height = 500
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 40;

    const x = d3.scaleBand()
      .domain(data.map(d => d.letter)) //letter = categories
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)]) //scale based on max frequency
      .range([height - marginBottom, marginTop])
      .padding(0.1);

      const svg = d3.create("svg")
        .attr("width", width)
        .attr("heigh", height)
        .attr("viewBox", [0,0,width,heighy])
        .attr("style", "max-width: 100%; height: auto;")
      
        svg.append("g")
          .attr("fill", "pink")
          .selectAll("rect")
          
  }
  console.log("Hello, world!");

})());