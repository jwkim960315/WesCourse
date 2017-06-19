<% if (!courseRating) { %>
                $('.chart-container').append('<p style="text-align:center;">NO DATA. PLEASE EVALUATE THIS COURSE IF YOU HAVE TAKEN IT.</p>');
            <% } else { %>
                <% var tmp = []; %>
                <% for (var i=0;i < Object.keys(courseRating).length-2; ++i) { %>
                    <% tmp.push(courseRating[Object.keys(courseRating)[i]]) %>
                <% } %>
                var ctx = document.getElementById("myChart");
                var myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ["Difficulty","Organization","Effort Required","Professor Rating"],
                        datasets: [{
                            label: 'Average Ratings',
                            data: <%- JSON.stringify(tmp) %>,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255,99,132,1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            xAxes: [{
                                barThickness: 120
                            }],
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
            <% } %>