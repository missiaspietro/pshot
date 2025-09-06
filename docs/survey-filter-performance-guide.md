# Survey Response Filter - Performance Guide

## Database Optimization

### Recommended Index
To optimize filter performance, ensure the following index exists on the `respostas_pesquisas` table:

```sql
-- Index for response filtering
CREATE INDEX IF NOT EXISTS idx_respostas_pesquisas_resposta 
ON respostas_pesquisas (resposta);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_respostas_pesquisas_rede_resposta_criado 
ON respostas_pesquisas (rede, resposta, criado_em);
```

### Query Performance
The filter implementation uses efficient WHERE clauses:
- Single equality check: `WHERE resposta = ?`
- Combined with existing filters: `WHERE rede = ? AND resposta = ?`
- Date range optimization: Uses existing date indexes

## Frontend Optimization

### Debouncing
Filter changes are debounced to prevent excessive API calls:
- 300ms delay before triggering new requests
- Automatic cancellation of pending requests
- Loading states during transitions

### Memory Management
- Automatic cleanup of event listeners in dropdown component
- Proper disposal of fetch AbortControllers
- Garbage collection of filtered data when modal closes

### Caching Strategy
- Results cached for 5 minutes per filter combination
- Cache invalidation on filter changes
- Memory-efficient storage using WeakMap

## Performance Monitoring

### Key Metrics to Monitor
1. **API Response Time**: Should be < 500ms for filtered queries
2. **Database Query Time**: Should be < 100ms with proper indexes
3. **Frontend Render Time**: Should be < 50ms for filter changes
4. **Memory Usage**: Should not exceed 50MB for large datasets

### Performance Testing
Run the following commands to test performance:

```bash
# API performance test
npm run test:performance:api

# Frontend performance test  
npm run test:performance:frontend

# Database query analysis
npm run test:performance:db
```

## Optimization Recommendations

### For Large Datasets (>10,000 records)
1. Implement pagination in API responses
2. Use virtual scrolling in modal table
3. Add result count limits with user warnings
4. Consider server-side filtering for complex queries

### For High Traffic
1. Implement Redis caching for common filter combinations
2. Use CDN for static filter configurations
3. Add rate limiting to prevent abuse
4. Monitor and alert on performance degradation

### For Mobile Devices
1. Reduce initial data load size
2. Optimize dropdown rendering for touch devices
3. Use progressive loading for large result sets
4. Implement offline caching for recent filters

## Troubleshooting Performance Issues

### Slow Filter Responses
1. Check database indexes are present
2. Verify network latency to database
3. Monitor concurrent user load
4. Check for table locks or deadlocks

### High Memory Usage
1. Verify proper cleanup of event listeners
2. Check for memory leaks in modal component
3. Monitor garbage collection frequency
4. Reduce cached data retention time

### UI Lag During Filtering
1. Implement virtual scrolling for large tables
2. Use React.memo for expensive components
3. Debounce filter input changes
4. Show loading states during transitions

## Configuration

### Environment Variables
```env
# Performance tuning
SURVEY_FILTER_CACHE_TTL=300000  # 5 minutes
SURVEY_FILTER_DEBOUNCE_MS=300   # 300ms
SURVEY_FILTER_MAX_RESULTS=1000  # Result limit
SURVEY_FILTER_ENABLE_CACHE=true # Enable caching
```

### Runtime Configuration
```typescript
// In your application config
export const surveyFilterConfig = {
  cacheEnabled: process.env.SURVEY_FILTER_ENABLE_CACHE === 'true',
  cacheTTL: parseInt(process.env.SURVEY_FILTER_CACHE_TTL || '300000'),
  debounceMs: parseInt(process.env.SURVEY_FILTER_DEBOUNCE_MS || '300'),
  maxResults: parseInt(process.env.SURVEY_FILTER_MAX_RESULTS || '1000')
}
```

## Monitoring and Alerts

### Recommended Alerts
1. API response time > 1 second
2. Database query time > 500ms
3. Error rate > 5%
4. Memory usage > 100MB per user session

### Logging
Enable performance logging in production:
```typescript
console.time('survey-filter-query')
// ... filter logic
console.timeEnd('survey-filter-query')
```

## Best Practices

1. **Always use indexes** for filtered columns
2. **Limit result sets** to prevent memory issues
3. **Cache frequently used filters** to improve UX
4. **Monitor performance metrics** in production
5. **Test with realistic data volumes** during development
6. **Implement graceful degradation** for slow connections
7. **Use loading states** to improve perceived performance
8. **Optimize for mobile devices** with smaller screens and slower connections