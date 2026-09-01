# Known Issues - RESOLVED

## ✅ Fixed: JSON extraction fails on truncated LLM responses

**Error**: `All JSON extraction methods failed for response of 1147 chars`
**Error**: `No JSON found in LLM response: {"matched_skills": ["scala", "java", "python", "c++", "microservices", "exce`

**Root cause**: LLM (`allam-2-7b`) sometimes truncates output mid-JSON when responses are long. The JSON extraction couldn't handle strings cut off mid-word (e.g., `"exce` instead of `"excel"`).

**Fix**: 
1. Added `_fix_truncated_string_values()` function that detects and fixes truncated JSON by:
   - Finding last complete array item before cutoff
   - Removing incomplete key-value pairs at the end
   - Closing brackets properly after truncation recovery
2. Added retry with shorter input on extraction failure - if JSON extraction fails, the next retry uses a shortened prompt

## ✅ Fixed: Dashboard data loading failure after analysis

**Error**: `failed to load the data` after running analysis

**Root cause**: Route ordering - `/analyses/count` was defined AFTER `/analyses/{analysis_id}`, so FastAPI matched `/analyses/count` to the `{analysis_id}` route with `analysis_id="count"`, causing an invalid ObjectId error.

**Fix**: Moved `/analyses/count` route BEFORE `/analyses/{analysis_id}` in `server.py`

## ✅ Fixed: Landing page overflow (going outside boundary)

**Error**: Content going outside the viewport boundary

**Fix**: Added `overflow-x-hidden` to the Landing page root container

## ✅ Fixed: Sign In button on Landing page

**Error**: Landing page showed both "Get Started" and "Sign In" buttons

**Fix**: Removed "Sign In" button - only "Get Started" remains on Landing page
