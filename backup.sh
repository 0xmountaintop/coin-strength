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

# yarn ts-node src/tools/dispatch-workflow.ts \
#   --owner 0xmountaintop \
#   --repo coin-strength \
#   --workflow price-fetcher.yml \
#   --ref main \
#   --inputs '{"DATE":"2024-03-20"}'

########################

# git fetch --prune

########################

# git for-each-ref --format='%(refname:short) %(objectname)' refs/remotes/

########################

# while IFS= read -r commit; do
#   git cherry-pick "$commit"
# done < commits.txt

########################
