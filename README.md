# partyShots

### A photo sharing website written with Vite, Django, postgres and Amazon S3 storage.  

## Structure
This is quite simple.  Users create albums, and albums have files.  Any user is allowed to add files to any album.  
Files may be removed from an album only by the user who posted them, or the creator of the album.  

Everything is public.  


## Todo List

* Lock Album (maybe)
* File Size Limits
* Subscribe to Album



## Upgrades 

Optimization Recommendations for 
partyshot/views.py
After reviewing your Django views file, here are the key optimizations I recommend:

1. Database Query Optimization
Issue: N+1 query problems in several views

get_album
 (lines 148-159): Generates a presigned URL for each photo individually in a loop
delete_album
 (lines 324-337): Queries photos then iterates to delete S3 objects
delete_photos
 (lines 369-387): Individual Photo.objects.get() calls in a loop
Recommendations:

Use select_related() and prefetch_related() to reduce database queries
Batch S3 operations where possible
Use bulk_delete() for S3 operations
2. Security & Authentication
Issue: Inconsistent authentication patterns

Some views use @csrf_exempt but should use proper CSRF protection
Mix of authentication checks (some check is_authenticated, others don't)
Recommendations:

Use Django REST framework's authentication classes instead of @csrf_exempt
Implement consistent permission checking using decorators
Add rate limiting to prevent abuse (especially on 
upload_photo
, 
register_user
)
3. Error Handling & Logging
Issue: Generic exception catching loses valuable debugging information

Lines 37, 66, 92, 121, 167, etc. all use except Exception as e
Print statements instead of proper logging (line 239)
Recommendations:

Use Python's logging module instead of print()
Catch specific exceptions rather than broad Exception
Add structured logging for better monitoring
4. Code Duplication
Issue: Repeated patterns across views

JSON parsing and error handling repeated in multiple views
Presigned URL generation logic duplicated
Authentication checks duplicated
Recommendations:

Create decorator functions for common patterns (auth checks, JSON parsing)
Extract presigned URL generation into a helper function that handles batches
Use mixins or base classes for common functionality
5. Performance - File Upload
Issue: 
upload_photo
 reads entire file into memory (line 214)

Could cause memory issues with large files
Thumbnail generation is synchronous and blocks the response
Recommendations:

Stream large files directly to S3 instead of reading into memory
Use Celery or Django-Q for asynchronous thumbnail generation
Add file size validation before processing
Consider using multipart uploads for large files
6. S3 Operations
Issue: Sequential S3 deletions in loops

delete_album
 and 
delete_photos
 delete S3 objects one at a time
No retry logic if S3 operations fail
Recommendations:

Use S3 batch delete operations (delete_objects() API)
Implement retry logic with exponential backoff
Consider using SQS for reliable deletion queue
7. Data Validation
Issue: Minimal input validation

No validation for file types in 
upload_photo
No size limits enforced
No sanitization of user inputs
Recommendations:

Add file type validation (whitelist allowed extensions)
Enforce file size limits
Validate and sanitize all user inputs
Use Django forms or serializers for validation
8. Response Optimization
Issue: Generating presigned URLs synchronously for all photos

get_album
 generates URLs for all photos before responding
Could be slow with many photos
Recommendations:

Paginate photo results
Generate presigned URLs lazily on the frontend as needed
Cache presigned URLs (they're valid for a time period)
Priority Order:
High: Security fixes (#2), File upload memory issues (#5)
Medium: Database query optimization (#1), Error handling (#3)
Low: Code duplication (#4), S3 batch operations (#6)
