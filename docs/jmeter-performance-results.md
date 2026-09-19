# OpenCart JMeter Performance Testing

## Test Environment
- Application: OpenCart
- Environment: Local Docker
- Tool: Apache JMeter 5.6.3
- Endpoint: HTTP GET /
- Host: localhost:8080

## Results

| Virtual Users | Requests | Avg Response | Min | Max | Error % | Throughput |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 10 | 63 ms | 43 ms | 241 ms | 0% | 15.7/sec |
| 10 | 100 | 52 ms | 40 ms | 254 ms | 0% | 10.5/sec |
| 50 | 500 | 61 ms | 41 ms | 273 ms | 0% | 48.4/sec |
| 100 | 1000 | 947 ms | 43 ms | 5887 ms | 0% | 47.0/sec |
| 200 | 2000 | 3922 ms | 50 ms | 36451 ms | 0% | 35.9/sec |
| 300 | 3000 | 4898 ms | 69 ms | 49495 ms | 0% | 41.4/sec |

## Findings
- 0% HTTP errors across all test runs.
- Performance remained fast through the 50-user test.
- Significant latency degradation appeared at 100 virtual users.
- At 300 virtual users, average response time reached 4.9 seconds and maximum reached 49.5 seconds.
- Throughput did not scale proportionally as load increased.