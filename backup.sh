# start_date="2024-12-22"
# end_date="2024-12-32"
# repo="git@github.com:0xmountaintop/coin-strength.git"

# current_date="$start_date"
# while [[ "$current_date" < "$end_date" ]]; do
#     branch_name=20$(date -j -f "%Y-%m-%d" "$current_date" +"%y-%m-%d")
#     git checkout -b "$branch_name"
#     git push "$repo" "$branch_name"
#     current_date=$(date -j -v+1d -f "%Y-%m-%d" "$current_date" +"%Y-%m-%d")
# done

########################

# start_date="2024-12-22"
# end_date="2024-12-32"

# current_date="$start_date"
# while [[ "$current_date" < "$end_date" ]]; do
#     # Create branch name in the format YY-MM-DD
#     branch_name=20$(date -j -f "%Y-%m-%d" "$current_date" +"%y-%m-%d")
    
#     # Run workflow dispatch for each date
#     yarn dispatch \
#         --owner 0xmountaintop \
#         --repo coin-strength \
#         --workflow price-fetcher.yml \
#         --ref "$branch_name" \
#         --inputs "{\"DATE\":\"$current_date\"}"
    
#     # Increment date by 1 day
#     current_date=$(date -j -v+1d -f "%Y-%m-%d" "$current_date" +"%Y-%m-%d")
    
#     # Add a small delay to avoid rate limiting
#     sleep 2
# done

########################

# git fetch --prune

########################

# git for-each-ref --format='%(refname:short) %(objectname)' refs/remotes/

########################

# while IFS= read -r commit; do
#   git cherry-pick "$commit"
# done < commits.txt

########################
